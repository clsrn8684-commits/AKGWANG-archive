"use client"

import { useState } from "react"
import { X, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"

const ADMIN_PASSWORD = "1211"

interface AdminPasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AdminPasswordDialog({
  open,
  onOpenChange,
  onSuccess,
}: AdminPasswordDialogProps) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setPassword("")
      setError(false)
      onSuccess()
    } else {
      setError(true)
    }
  }

  const handleClose = () => {
    setPassword("")
    setError(false)
    onOpenChange(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-sm border border-border bg-card p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">관리자 인증</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-2 block text-sm text-muted-foreground">
              관리자 비밀번호를 입력하세요
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError(false)
              }}
              placeholder="••••"
              autoFocus
              className={`w-full border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none ${
                error ? "border-destructive" : "border-input focus:border-primary"
              }`}
            />
            {error && (
              <p className="mt-2 text-sm text-destructive">
                비밀번호가 올바르지 않습니다
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              취소
            </Button>
            <Button type="submit" disabled={!password}>
              확인
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
