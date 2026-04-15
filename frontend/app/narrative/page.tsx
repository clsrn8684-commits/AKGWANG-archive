"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Plus, Trash2, X, FileText, Edit, ImagePlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AdminPasswordDialog } from "@/components/admin-password-dialog"

interface NarrativeItem {
  id: string
  title: string
  content: string
  imageUrl?: string
  createdAt: string
  updatedAt: string
}

export default function NarrativePage() {
  const [items, setItems] = useState<NarrativeItem[]>([])
  const [showEditor, setShowEditor] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [pendingAction, setPendingAction] = useState<"add" | "edit" | "delete" | null>(null)
  const [editingItem, setEditingItem] = useState<NarrativeItem | null>(null)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [newItem, setNewItem] = useState<{ title: string; content: string; imageUrl?: string }>({ title: "", content: "" })

  useEffect(() => {
    const stored = localStorage.getItem("narrative-items")
    if (stored) {
      const parsed = JSON.parse(stored)
      setItems(parsed)
      if (parsed.length > 0) {
        setSelectedId(parsed[0].id)
      }
    }
  }, [])

  const saveItems = (newItems: NarrativeItem[]) => {
    setItems(newItems)
    localStorage.setItem("narrative-items", JSON.stringify(newItems))
  }

  const handleAddClick = () => {
    setPendingAction("add")
    setShowPasswordDialog(true)
  }

  const handleEditClick = (item: NarrativeItem) => {
    setEditingItem(item)
    setNewItem({ title: item.title, content: item.content, imageUrl: item.imageUrl })
    setPendingAction("edit")
    setShowPasswordDialog(true)
  }

  const handleDeleteClick = (id: string) => {
    setDeleteTargetId(id)
    setPendingAction("delete")
    setShowPasswordDialog(true)
  }

  const handlePasswordSuccess = () => {
    setShowPasswordDialog(false)
    if (pendingAction === "add") {
      setNewItem({ title: "", content: "" })
      setEditingItem(null)
      setShowEditor(true)
    } else if (pendingAction === "edit") {
      setShowEditor(true)
    } else if (pendingAction === "delete" && deleteTargetId) {
      const newItems = items.filter((item) => item.id !== deleteTargetId)
      saveItems(newItems)
      if (selectedId === deleteTargetId) {
        setSelectedId(newItems[0]?.id || null)
      }
      setDeleteTargetId(null)
    }
    setPendingAction(null)
  }

  const handleSaveItem = () => {
    if (!newItem.title || !newItem.content) return

    if (editingItem) {
      const updated: NarrativeItem = {
        ...editingItem,
        title: newItem.title,
        content: newItem.content,
        imageUrl: newItem.imageUrl,
        updatedAt: new Date().toISOString(),
      }
      const newItems = items.map((item) => (item.id === editingItem.id ? updated : item))
      saveItems(newItems)
    } else {
      const item: NarrativeItem = {
        id: Date.now().toString(),
        title: newItem.title,
        content: newItem.content,
        imageUrl: newItem.imageUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      saveItems([item, ...items])
      setSelectedId(item.id)
    }

    setNewItem({ title: "", content: "" })
    setEditingItem(null)
    setShowEditor(false)
  }

  const selectedItem = items.find((item) => item.id === selectedId)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewItem(prev => ({ ...prev, imageUrl: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar - List of narratives */}
      <div className="w-72 border-r border-border bg-card/50">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="font-bold tracking-wider">敍事 목록</h2>
          <Button size="sm" variant="ghost" onClick={handleAddClick}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="h-[calc(100vh-57px)] overflow-y-auto">
          {items.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              작성된 서사가 없습니다
            </div>
          ) : (
            <ul>
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setSelectedId(item.id)}
                    className={`w-full border-b border-border/50 p-4 text-left transition-colors hover:bg-muted/50 ${
                      selectedId === item.id ? "bg-muted border-l-2 border-l-primary" : ""
                    }`}
                  >
                    <h3 className="font-medium text-foreground line-clamp-1">{item.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {item.content.slice(0, 100)}...
                    </p>
                    <time className="mt-2 block text-xs text-muted-foreground/70">
                      {new Date(item.updatedAt).toLocaleDateString("ko-KR")}
                    </time>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-wider text-foreground">敍事</h1>
          <p className="mt-2 text-muted-foreground">서사 - 장문의 이야기</p>
          <div className="mt-6 h-px bg-border" />
        </div>

        {/* Selected content */}
        {selectedItem ? (
          <article className="prose prose-invert max-w-none">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="mb-2 text-3xl font-bold text-foreground">{selectedItem.title}</h2>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <time>작성: {new Date(selectedItem.createdAt).toLocaleDateString("ko-KR")}</time>
                  {selectedItem.updatedAt !== selectedItem.createdAt && (
                    <time>수정: {new Date(selectedItem.updatedAt).toLocaleDateString("ko-KR")}</time>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEditClick(selectedItem)}>
                  <Edit className="mr-2 h-4 w-4" />
                  수정
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteClick(selectedItem.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {selectedItem.imageUrl && (
              <div className="mb-8 w-full max-w-2xl overflow-hidden rounded-md border border-border/50">
                <Image
                  src={selectedItem.imageUrl}
                  alt={selectedItem.title}
                  width={800}
                  height={400}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}
            
            <div className="mt-8 whitespace-pre-wrap text-foreground leading-loose">
              {selectedItem.content}
            </div>
          </article>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <FileText className="mb-4 h-16 w-16 opacity-50" />
            <p className="text-lg">서사를 선택하거나 새로 작성하세요</p>
          </div>
        )}
      </div>

      {/* Editor Dialog */}
      {showEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="h-[80vh] w-full max-w-3xl border border-border bg-card p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editingItem ? "서사 수정" : "새 서사 작성"}
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setShowEditor(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex h-[calc(100%-120px)] flex-col gap-4 overflow-y-auto pr-2">
              <div>
                <label className="mb-2 block text-sm text-muted-foreground">제목</label>
                <input
                  type="text"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  placeholder="제목을 입력하세요..."
                  className="w-full border border-input bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-muted-foreground">이미지 첨부 (선택)</label>
                {newItem.imageUrl ? (
                  <div className="relative group w-fit">
                    <Image 
                      src={newItem.imageUrl} 
                      alt="Preview" 
                      width={200}
                      height={150}
                      className="max-h-40 w-auto rounded-sm border border-border" 
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity bg-destructive/90 text-destructive-foreground hover:bg-destructive"
                      onClick={() => setNewItem({ ...newItem, imageUrl: undefined })}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex w-fit cursor-pointer items-center justify-center rounded-sm border border-dashed border-input bg-background px-4 py-3 hover:border-primary/50 hover:bg-accent transition-colors">
                    <ImagePlus className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">이미지 업로드</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>

              <div className="flex-1 min-h-[300px]">
                <label className="mb-2 block text-sm text-muted-foreground">내용</label>
                <textarea
                  value={newItem.content}
                  onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
                  placeholder="서사 내용을 작성하세요..."
                  className="h-full w-full resize-none border border-input bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEditor(false)}>
                취소
              </Button>
              <Button onClick={handleSaveItem} disabled={!newItem.title || !newItem.content}>
                {editingItem ? "수정하기" : "저장하기"}
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
