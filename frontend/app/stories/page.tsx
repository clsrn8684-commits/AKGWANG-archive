"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Plus, Trash2, X, Tag, Settings, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AdminPasswordDialog } from "@/components/admin-password-dialog"

interface StoryItem {
  id: string
  category: string
  title: string
  content: string
  images: string[]
  createdAt: string
}

const DEFAULT_CATEGORIES = ["일상", "잡담", "기타"]

export default function StoriesPage() {
  const [items, setItems] = useState<StoryItem[]>([])
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES)
  const [activeCategory, setActiveCategory] = useState<string | "all">("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [pendingAction, setPendingAction] = useState<"add" | "delete" | "category" | null>(null)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<StoryItem | null>(null)
  const [newCategory, setNewCategory] = useState("")
  const [newItem, setNewItem] = useState<{
    category: string
    title: string
    content: string
    images: string[]
  }>({
    category: "",
    title: "",
    content: "",
    images: [""],
  })

  useEffect(() => {
    const storedItems = localStorage.getItem("stories-items")
    const storedCategories = localStorage.getItem("stories-categories")
    if (storedItems) setItems(JSON.parse(storedItems))
    if (storedCategories) setCategories(JSON.parse(storedCategories))
  }, [])

  const saveItems = (newItems: StoryItem[]) => {
    setItems(newItems)
    localStorage.setItem("stories-items", JSON.stringify(newItems))
  }

  const saveCategories = (newCategories: string[]) => {
    setCategories(newCategories)
    localStorage.setItem("stories-categories", JSON.stringify(newCategories))
  }

  const filteredItems = activeCategory === "all"
    ? items
    : items.filter((item) => item.category === activeCategory)

  const handleAddClick = () => {
    setPendingAction("add")
    setShowPasswordDialog(true)
  }

  const handleCategoryClick = () => {
    setPendingAction("category")
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
      setNewItem({ category: categories[0] || "", title: "", content: "", images: [""] })
      setShowAddDialog(true)
    } else if (pendingAction === "category") {
      setShowCategoryDialog(true)
    } else if (pendingAction === "delete" && deleteTargetId) {
      const newItems = items.filter((item) => item.id !== deleteTargetId)
      saveItems(newItems)
      setDeleteTargetId(null)
    }
    setPendingAction(null)
  }

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      saveCategories([...categories, newCategory.trim()])
      setNewCategory("")
    }
  }

  const handleDeleteCategory = (cat: string) => {
    saveCategories(categories.filter((c) => c !== cat))
    if (activeCategory === cat) setActiveCategory("all")
  }

  const handleAddImage = () => {
    setNewItem({ ...newItem, images: [...newItem.images, ""] })
  }

  const handleRemoveImage = (index: number) => {
    const newImages = newItem.images.filter((_, i) => i !== index)
    setNewItem({ ...newItem, images: newImages.length ? newImages : [""] })
  }

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...newItem.images]
    newImages[index] = value
    setNewItem({ ...newItem, images: newImages })
  }

  const handleAddItem = () => {
    if (!newItem.title || !newItem.category) return

    const item: StoryItem = {
      id: Date.now().toString(),
      category: newItem.category,
      title: newItem.title,
      content: newItem.content,
      images: newItem.images.filter((url) => url.trim() !== ""),
      createdAt: new Date().toISOString(),
    }

    saveItems([item, ...items])
    setNewItem({ category: categories[0] || "", title: "", content: "", images: [""] })
    setShowAddDialog(false)
  }

  return (
    <div className="min-h-screen bg-background p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-wider text-foreground">閑談</h1>
            <p className="mt-2 text-muted-foreground">썰 - 다양한 이야기</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCategoryClick}>
              <Settings className="mr-2 h-4 w-4" />
              카테고리 관리
            </Button>
            <Button
              onClick={handleAddClick}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              추가
            </Button>
          </div>
        </div>
        <div className="mt-6 h-px bg-border" />
      </div>

      {/* Category Tabs */}
      <div className="mb-8 flex flex-wrap gap-2">
        <Button
          variant={activeCategory === "all" ? "default" : "outline"}
          onClick={() => setActiveCategory("all")}
          size="sm"
        >
          전체
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={activeCategory === cat ? "default" : "outline"}
            onClick={() => setActiveCategory(cat)}
            size="sm"
          >
            <Tag className="mr-1 h-3 w-3" />
            {cat}
          </Button>
        ))}
      </div>

      {/* Stories Grid */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <ImageIcon className="mb-4 h-16 w-16 opacity-50" />
          <p className="text-lg">
            {activeCategory === "all"
              ? "등록된 썰이 없습니다"
              : `${activeCategory} 카테고리에 등록된 썰이 없습니다`}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <article
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="group relative cursor-pointer overflow-hidden border border-border bg-card transition-all hover:border-primary/30"
            >
              {item.images.length > 0 && item.images[0] ? (
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
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
                <div className="flex aspect-video items-center justify-center bg-muted">
                  <Tag className="h-12 w-12 text-muted-foreground/30" />
                </div>
              )}
              <div className="p-4">
                <div className="mb-2">
                  <span className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
                    {item.category}
                  </span>
                </div>
                <h3 className="font-medium text-foreground line-clamp-1">{item.title}</h3>
                {item.content && (
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {item.content}
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
          ))}
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
              <div className="flex items-center gap-3">
                <span className="rounded bg-primary/10 px-2 py-0.5 text-sm text-primary">
                  {selectedItem.category}
                </span>
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

            {selectedItem.content && (
              <div className="border-t border-border p-4">
                <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                  {selectedItem.content}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Category Management Dialog */}
      {showCategoryDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md border border-border bg-card p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">카테고리 관리</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowCategoryDialog(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="새 카테고리 이름..."
                  className="flex-1 border border-input bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                />
                <Button onClick={handleAddCategory} disabled={!newCategory.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {categories.map((cat) => (
                <div
                  key={cat}
                  className="flex items-center justify-between rounded border border-border bg-muted/50 px-4 py-2"
                >
                  <span>{cat}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCategory(cat)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={() => setShowCategoryDialog(false)}>완료</Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto border border-border bg-card p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">새 썰 추가</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowAddDialog(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-muted-foreground">카테고리</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="w-full border border-input bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-muted-foreground">제목</label>
                <input
                  type="text"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  placeholder="제목..."
                  className="w-full border border-input bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-muted-foreground">내용</label>
                <textarea
                  value={newItem.content}
                  onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
                  placeholder="내용..."
                  rows={5}
                  className="w-full resize-none border border-input bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm text-muted-foreground">이미지 URL</label>
                  <Button type="button" variant="ghost" size="sm" onClick={handleAddImage}>
                    <Plus className="mr-1 h-3 w-3" />
                    추가
                  </Button>
                </div>
                <div className="space-y-2">
                  {newItem.images.map((url, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => handleImageChange(index, e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1 border border-input bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      />
                      {newItem.images.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveImage(index)}
                          className="text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                취소
              </Button>
              <Button onClick={handleAddItem} disabled={!newItem.title || !newItem.category}>
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
