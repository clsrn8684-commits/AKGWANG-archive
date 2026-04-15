"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Plus, Trash2, X, Palette, PenTool, Briefcase, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AdminPasswordDialog } from "@/components/admin-password-dialog"

type WorkCategory = "그림" | "글" | "커미션"

interface WorkItem {
  id: string
  category: WorkCategory
  title: string
  description: string
  images: string[]
  link?: string
  createdAt: string
}

const categoryIcons: Record<WorkCategory, React.ElementType> = {
  "그림": Palette,
  "글": PenTool,
  "커미션": Briefcase,
}

const categoryLabels: Record<WorkCategory, { ko: string; hanja: string }> = {
  "그림": { ko: "그림", hanja: "畵" },
  "글": { ko: "글", hanja: "文" },
  "커미션": { ko: "커미션", hanja: "委" },
}

export default function WorksPage() {
  const [items, setItems] = useState<WorkItem[]>([])
  const [activeCategory, setActiveCategory] = useState<WorkCategory | "all">("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [pendingAction, setPendingAction] = useState<"add" | "delete" | null>(null)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<WorkItem | null>(null)
  const [newItem, setNewItem] = useState<{
    category: WorkCategory
    title: string
    description: string
    images: string[]
    link: string
  }>({
    category: "그림",
    title: "",
    description: "",
    images: [],
    link: "",
  })

  useEffect(() => {
    const stored = localStorage.getItem("works-items")
    if (stored) {
      setItems(JSON.parse(stored))
    }
  }, [])

  const saveItems = (newItems: WorkItem[]) => {
    setItems(newItems)
    localStorage.setItem("works-items", JSON.stringify(newItems))
  }

  const filteredItems = activeCategory === "all"
    ? items
    : items.filter((item) => item.category === activeCategory)

  const handleAddClick = () => {
    setPendingAction("add")
    setShowPasswordDialog(true)
  }

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleteTargetId(id)
    setPendingAction("delete")
    setShowPasswordDialog(true)
  }

  const handlePasswordSuccess = () => {
    setShowPasswordDialog(false)
    if (pendingAction === "add") {
      setShowAddDialog(true)
    } else if (pendingAction === "delete" && deleteTargetId) {
      const newItems = items.filter((item) => item.id !== deleteTargetId)
      saveItems(newItems)
      setDeleteTargetId(null)
    }
    setPendingAction(null)
  }

  const handleRemoveImage = (index: number) => {
    const newImages = newItem.images.filter((_, i) => i !== index)
    setNewItem({ ...newItem, images: newImages })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const newImageUrls = await Promise.all(
      files.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result as string)
            reader.readAsDataURL(file)
          })
      )
    )

    setNewItem((prev) => ({
      ...prev,
      images: [...prev.images, ...newImageUrls],
    }))
  }

  const handleAddItem = () => {
    if (!newItem.title) return

    const item: WorkItem = {
      id: Date.now().toString(),
      category: newItem.category,
      title: newItem.title,
      description: newItem.description,
      images: newItem.images.filter((url) => url.trim() !== ""),
      link: newItem.link.trim() !== "" ? newItem.link.trim() : undefined,
      createdAt: new Date().toISOString(),
    }

    saveItems([item, ...items])
    setNewItem({ category: "그림", title: "", description: "", images: [], link: "" })
    setShowAddDialog(false)
  }

  return (
    <div className="min-h-screen bg-background p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-wider text-foreground">作品</h1>
            <p className="mt-2 text-muted-foreground">작품 - 그림, 글, 커미션</p>
          </div>
          <Button
            onClick={handleAddClick}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            추가
          </Button>
        </div>
        <div className="mt-6 h-px bg-border" />
      </div>

      {/* Category Tabs */}
      <div className="mb-8 flex gap-2">
        <Button
          variant={activeCategory === "all" ? "default" : "outline"}
          onClick={() => setActiveCategory("all")}
          className="px-6"
        >
          전체
        </Button>
        {(Object.keys(categoryLabels) as WorkCategory[]).map((cat) => {
          const Icon = categoryIcons[cat]
          return (
            <Button
              key={cat}
              variant={activeCategory === cat ? "default" : "outline"}
              onClick={() => setActiveCategory(cat)}
              className="px-6"
            >
              <Icon className="mr-2 h-4 w-4" />
              <span className="mr-1">{categoryLabels[cat].hanja}</span>
              <span className="text-xs text-muted-foreground">({categoryLabels[cat].ko})</span>
            </Button>
          )
        })}
      </div>

      {/* Works Grid */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <ImageIcon className="mb-4 h-16 w-16 opacity-50" />
          <p className="text-lg">
            {activeCategory === "all"
              ? "등록된 작품이 없습니다"
              : `등록된 ${activeCategory} 작품이 없습니다`}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => {
            const Icon = categoryIcons[item.category]
            return (
              <article
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="group relative cursor-pointer overflow-hidden border border-border bg-card transition-all hover:border-primary/30"
              >
                {item.images.length > 0 && item.images[0] ? (
                  <div className="relative aspect-square w-full overflow-hidden bg-muted">
                    <Image
                      src={item.images[0]}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {item.images.length > 1 && (
                      <div className="absolute bottom-2 right-2 rounded bg-background/80 px-2 py-1 text-xs">
                        +{item.images.length - 1}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex aspect-square items-center justify-center bg-muted">
                    <Icon className="h-16 w-16 text-muted-foreground/30" />
                  </div>
                )}
                <div className="p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-xs text-primary">{categoryLabels[item.category].hanja}</span>
                    <span className="text-xs text-muted-foreground">{item.category}</span>
                  </div>
                  <h3 className="font-medium text-foreground line-clamp-1">{item.title}</h3>
                  {item.description && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  <div className="mt-3 flex items-center justify-between">
                    <time className="text-xs text-muted-foreground">
                      {new Date(item.createdAt).toLocaleDateString("ko-KR")}
                    </time>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDeleteClick(item.id, e)}
                      className="text-destructive opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-4xl overflow-y-auto border border-border bg-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border p-4">
              <div className="flex items-center gap-2">
                <span className="text-lg text-primary">{categoryLabels[selectedItem.category].hanja}</span>
                <h2 className="text-xl font-bold">{selectedItem.title}</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedItem(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {selectedItem.images.length > 0 && (
              <div className="space-y-4 p-4">
                {selectedItem.images.map((url, index) => (
                  url && (
                    <div key={index} className="relative w-full">
                      <Image
                        src={url}
                        alt={`${selectedItem.title} - ${index + 1}`}
                        width={800}
                        height={600}
                        className="w-full object-contain"
                      />
                    </div>
                  )
                ))}
              </div>
            )}
            
            {selectedItem.description && (
              <div className="border-t border-border p-4">
                <p className="whitespace-pre-wrap text-foreground">{selectedItem.description}</p>
              </div>
            )}

            {selectedItem.link && (
              <div className="border-t border-border p-4">
                <a 
                  href={selectedItem.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all"
                >
                  {selectedItem.link}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto border border-border bg-card p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">새 작품 추가</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowAddDialog(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-muted-foreground">카테고리</label>
                <div className="flex gap-2">
                  {(Object.keys(categoryLabels) as WorkCategory[]).map((cat) => (
                    <Button
                      key={cat}
                      type="button"
                      variant={newItem.category === cat ? "default" : "outline"}
                      onClick={() => setNewItem({ ...newItem, category: cat })}
                      className="flex-1"
                    >
                      {categoryLabels[cat].ko}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-muted-foreground">제목</label>
                <input
                  type="text"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  placeholder="작품 제목..."
                  className="w-full border border-input bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-muted-foreground">링크 URL (선택)</label>
                <input
                  type="url"
                  value={newItem.link}
                  onChange={(e) => setNewItem({ ...newItem, link: e.target.value })}
                  placeholder="https://..."
                  className="w-full border border-input bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-muted-foreground">설명 (선택)</label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="작품 설명..."
                  rows={3}
                  className="w-full resize-none border border-input bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-muted-foreground">이미지 첨부</label>
                <div className="space-y-4">
                  {newItem.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {newItem.images.map((url, index) => (
                        <div key={index} className="relative group aspect-square rounded-sm border border-border w-full overflow-hidden">
                          <Image src={url} alt="업로드 이미지" fill className="object-cover" />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity bg-destructive/90 text-destructive-foreground hover:bg-destructive"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <label className="flex w-full cursor-pointer items-center justify-center rounded-sm border border-dashed border-input bg-background px-4 py-8 hover:border-primary/50 hover:bg-accent transition-colors">
                    <Plus className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">새 이미지 업로드하기 (여러 장 선택 가능)</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                취소
              </Button>
              <Button onClick={handleAddItem} disabled={!newItem.title}>
                추가하기
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Password Dialog */}
      <AdminPasswordDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
        onSuccess={handlePasswordSuccess}
      />
    </div>
  )
}
