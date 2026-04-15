"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Menu, X, ImagePlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AdminPasswordDialog } from "@/components/admin-password-dialog"

const menuItems = [
  { href: "/", label: "首頁", description: "메인" },
  { href: "/logline", label: "綱要", description: "로그라인" },
  { href: "/narrative", label: "敍事", description: "서사" },
  { href: "/works", label: "作品", description: "작품" },
  { href: "/stories", label: "閑談", description: "썰" },
  { href: "/archive", label: "備忘", description: "티알 백업" },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [sidebarImage, setSidebarImage] = useState<string | null>(null)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [pendingAction, setPendingAction] = useState<"add" | "remove" | null>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSidebarImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddImage = () => {
    setPendingAction("add")
    setShowPasswordDialog(true)
  }

  const handleRemoveImage = () => {
    setPendingAction("remove")
    setShowPasswordDialog(true)
  }

  const handlePasswordSuccess = () => {
    if (pendingAction === "add") {
      document.getElementById("sidebar-image-input")?.click()
    } else if (pendingAction === "remove") {
      setSidebarImage(null)
    }
    setPendingAction(null)
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 border-r border-sidebar-border bg-sidebar transition-transform duration-300",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-24 items-center justify-center border-b border-sidebar-border">
            <Link href="/" className="flex flex-col items-center gap-1">
              <span className="text-3xl font-bold text-primary tracking-widest">惡狂</span>
              <span className="text-xs text-muted-foreground tracking-wider">악광</span>
            </Link>
          </div>

          <nav className="flex-1 px-4 py-8 overflow-y-auto">
            <ul className="flex flex-col gap-2">
              {menuItems.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== "/" && pathname.startsWith(item.href))
                
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-4 rounded-sm px-4 py-3 text-sm transition-all duration-300",
                        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        "border-l-2 border-transparent",
                        isActive && "border-l-primary bg-sidebar-accent text-primary font-medium"
                      )}
                    >
                      <div className="flex flex-col">
                        <span className="text-lg tracking-wider">{item.label}</span>
                        <span className="text-xs text-muted-foreground">{item.description}</span>
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>

            <div className="mt-6 px-2">
              {sidebarImage ? (
                <div className="relative group">
                  <Image
                    src={sidebarImage}
                    alt="Sidebar"
                    width={200}
                    height={150}
                    className="w-full h-auto object-contain rounded-sm border border-border/30"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  className="w-full border border-dashed border-border/50 hover:border-primary/50 py-4"
                  onClick={handleAddImage}
                >
                  <ImagePlus className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">이미지 추가</span>
                </Button>
              )}
              <input
                id="sidebar-image-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
          </nav>
        </div>
      </aside>

      <AdminPasswordDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
        onSuccess={handlePasswordSuccess}
      />
    </>
  )
}
