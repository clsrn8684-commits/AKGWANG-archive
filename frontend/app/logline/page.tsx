"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Plus, Trash2, X, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AdminPasswordDialog } from "@/components/admin-password-dialog"

interface LoglineItem {
  id: string
  imageUrl: string
  text: string
  createdAt: string
}

export default function LoglinePage() {
  const [items, setItems] = useState<LoglineItem[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [pendingAction, setPendingAction] = useState<"add" | "delete" | null>(null)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [newItem, setNewItem] = useState({ imageUrl: "", text: "" })

  useEffect(() => {
    const stored = localStorage.getItem("logline-items")
    if (stored) {
      setItems(JSON.parse(stored))
    }
  }, [])

  const saveItems = (newItems: LoglineItem[]) => {
    setItems(newItems)
    localStorage.setItem("logline-items", JSON.stringify(newItems))
  }

  const handleAddClick = () => {
    setPendingAction("add")
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
      setShowAddDialog(true)
    } else if (pendingAction === "delete" && deleteTargetId) {
      const newItems = items.filter((item) => item.id !== deleteTargetId)
      saveItems(newItems)
      setDeleteTargetId(null)
    }
    setPendingAction(null)
  }

  const handleAddItem = () => {
    if (!newItem.imageUrl && !newItem.text) return
    
    const item: LoglineItem = {
      id: Date.now().toString(),
      imageUrl: newItem.imageUrl,
      text: newItem.text,
      createdAt: new Date().toISOString(),
    }
    
    saveItems([item, ...items])
    setNewItem({ imageUrl: "", text: "" })
    setShowAddDialog(false)
  }

  return (
    <div className="min-h-screen bg-background p-8">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-wider text-foreground">綱要</h1>
            <p className="mt-2 text-muted-foreground">로그라인 - 이미지와 텍스트</p>
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

      {/* Content Grid */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <ImageIcon className="mb-4 h-16 w-16 opacity-50" />
          <p className="text-lg">아직 등록된 로그라인이 없습니다</p>
          <p className="text-sm">관리자 권한으로 새 로그라인을 추가해주세요</p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2">
          {items.map((item) => (
            <article
              key={item.id}
              className="group relative overflow-hidden border border-border bg-card transition-all hover:border-primary/30"
            >
              {item.imageUrl && (
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                  <Image
                    src={item.imageUrl}
                    alt="로그라인 이미지"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="p-6">
                <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                  {item.text}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <time className="text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString("ko-KR")}
                  </time>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(item.id)}
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

      {/* Add Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-lg border border-border bg-card p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">새 로그라인 추가</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowAddDialog(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-muted-foreground">
                  이미지 URL (선택)
                </label>
                <input
                  type="url"
                  value={newItem.imageUrl}
                  onChange={(e) => setNewItem({ ...newItem, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full border border-input bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>
              
              <div>
                <label className="mb-2 block text-sm text-muted-foreground">
                  텍스트
                </label>
                <textarea
                  value={newItem.text}
                  onChange={(e) => setNewItem({ ...newItem, text: e.target.value })}
                  placeholder="로그라인 내용을 입력하세요..."
                  rows={5}
                  className="w-full border border-input bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                취소
              </Button>
              <Button onClick={handleAddItem} disabled={!newItem.text && !newItem.imageUrl}>
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
