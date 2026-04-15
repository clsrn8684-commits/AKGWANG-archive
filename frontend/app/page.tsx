"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ImagePlus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AdminPasswordDialog } from "@/components/admin-password-dialog"

type ImageType = "header" | "catalog" | "banner" | "grid1" | "grid2"

export default function HomePage() {
  const [headerImage, setHeaderImage] = useState<string | null>(null)
  const [catalogImage, setCatalogImage] = useState<string | null>(null)
  const [bannerImage, setBannerImage] = useState<string | null>(null)
  const [gridImage1, setGridImage1] = useState<string | null>(null)
  const [gridImage2, setGridImage2] = useState<string | null>(null)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [pendingAction, setPendingAction] = useState<{ type: "add" | "remove"; imageType: ImageType } | null>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, imageType: ImageType) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        if (imageType === "header") setHeaderImage(result)
        else if (imageType === "catalog") setCatalogImage(result)
        else if (imageType === "banner") setBannerImage(result)
        else if (imageType === "grid1") setGridImage1(result)
        else if (imageType === "grid2") setGridImage2(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddImage = (imageType: ImageType) => {
    setPendingAction({ type: "add", imageType })
    setShowPasswordDialog(true)
  }

  const handleRemoveImage = (imageType: ImageType) => {
    setPendingAction({ type: "remove", imageType })
    setShowPasswordDialog(true)
  }

  const handlePasswordSuccess = () => {
    if (!pendingAction) return
    if (pendingAction.type === "add") {
      document.getElementById(`${pendingAction.imageType}-image-input`)?.click()
    } else if (pendingAction.type === "remove") {
      if (pendingAction.imageType === "header") setHeaderImage(null)
      else if (pendingAction.imageType === "catalog") setCatalogImage(null)
      else if (pendingAction.imageType === "banner") setBannerImage(null)
      else if (pendingAction.imageType === "grid1") setGridImage1(null)
      else if (pendingAction.imageType === "grid2") setGridImage2(null)
    }
    setPendingAction(null)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        <div className="relative z-10 text-center px-4">
          {/* Header Image */}
          <div className="mb-8">
            {headerImage ? (
              <div className="relative inline-block group">
                <Image
                  src={headerImage}
                  alt="Header"
                  width={400}
                  height={200}
                  className="max-h-48 w-auto object-contain rounded-sm border border-border/30"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => handleRemoveImage("header")}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                className="border border-dashed border-border/50 hover:border-primary/50 px-8 py-6"
                onClick={() => handleAddImage("header")}
              >
                <ImagePlus className="h-6 w-6 mr-2 text-muted-foreground" />
                <span className="text-muted-foreground">헤더 이미지 추가</span>
              </Button>
            )}
            <input
              id="header-image-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageUpload(e, "header")}
            />
          </div>

          <div className="mb-6 flex items-center justify-center gap-4">
            <div className="h-px w-16 bg-primary/60" />
            <span className="text-sm text-muted-foreground tracking-[0.3em]">ARCHIVE</span>
            <div className="h-px w-16 bg-primary/60" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-primary tracking-wider mb-4">
            惡狂
          </h1>
          <p className="text-xl text-muted-foreground tracking-widest mb-2">악광</p>
          <p className="text-sm text-muted-foreground/70 max-w-md mx-auto leading-relaxed mt-6">
            그냥 두면 5년 안에 객사하는 여자, 그거 5달로 줄여주는 여자
          </p>
        </div>
      </section>

      <AdminPasswordDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
        onSuccess={handlePasswordSuccess}
      />

      {/* Categories Grid */}
      <section className="px-8 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <h2 className="text-lg text-muted-foreground tracking-[0.2em]">目錄</h2>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* 로그라인 */}
            <Link
              href="/logline"
              className="group relative overflow-hidden border border-border bg-card p-6 transition-all duration-300 hover:border-primary/50 hover:bg-card/80"
            >
              <div className="absolute right-0 top-0 h-20 w-20 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/5 transition-transform duration-500 group-hover:scale-150" />
              <h3 className="text-2xl font-bold tracking-wider text-foreground mb-1 mt-4">綱要</h3>
              <p className="text-sm text-primary/80">로그라인</p>
              <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full" />
            </Link>

            {/* 서사 */}
            <Link
              href="/narrative"
              className="group relative overflow-hidden border border-border bg-card p-6 transition-all duration-300 hover:border-primary/50 hover:bg-card/80"
            >
              <div className="absolute right-0 top-0 h-20 w-20 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/5 transition-transform duration-500 group-hover:scale-150" />
              <h3 className="text-2xl font-bold tracking-wider text-foreground mb-1 mt-4">敍事</h3>
              <p className="text-sm text-primary/80">서사</p>
              <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full" />
            </Link>

            {/* 작품 */}
            <Link
              href="/works"
              className="group relative overflow-hidden border border-border bg-card p-6 transition-all duration-300 hover:border-primary/50 hover:bg-card/80"
            >
              <div className="absolute right-0 top-0 h-20 w-20 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/5 transition-transform duration-500 group-hover:scale-150" />
              <h3 className="text-2xl font-bold tracking-wider text-foreground mb-1 mt-4">作品</h3>
              <p className="text-sm text-primary/80">작품</p>
              <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full" />
            </Link>

            {/* Grid Image 1 - 작품 아래 */}
            <div className="relative overflow-hidden border border-border bg-card p-6 transition-all duration-300 hover:border-primary/50">
              {gridImage1 ? (
                <div className="relative group h-full flex items-center justify-center">
                  <Image
                    src={gridImage1}
                    alt="Grid Image 1"
                    width={200}
                    height={150}
                    className="max-h-full w-auto object-contain"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleRemoveImage("grid1")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  className="w-full h-full min-h-[100px] border border-dashed border-border/50 hover:border-primary/50 flex flex-col gap-2"
                  onClick={() => handleAddImage("grid1")}
                >
                  <ImagePlus className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">이미지 추가</span>
                </Button>
              )}
              <input
                id="grid1-image-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e, "grid1")}
              />
            </div>

            {/* 썰 */}
            <Link
              href="/stories"
              className="group relative overflow-hidden border border-border bg-card p-6 transition-all duration-300 hover:border-primary/50 hover:bg-card/80"
            >
              <div className="absolute right-0 top-0 h-20 w-20 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/5 transition-transform duration-500 group-hover:scale-150" />
              <h3 className="text-2xl font-bold tracking-wider text-foreground mb-1 mt-4">閑談</h3>
              <p className="text-sm text-primary/80">썰</p>
              <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full" />
            </Link>

            {/* 티알 백업 */}
            <Link
              href="/archive"
              className="group relative overflow-hidden border border-border bg-card p-6 transition-all duration-300 hover:border-primary/50 hover:bg-card/80"
            >
              <div className="absolute right-0 top-0 h-20 w-20 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/5 transition-transform duration-500 group-hover:scale-150" />
              <h3 className="text-2xl font-bold tracking-wider text-foreground mb-1 mt-4">備忘</h3>
              <p className="text-sm text-primary/80">티알 백업</p>
              <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Quote */}
      <section className="border-t border-border px-8 py-12">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-lg text-muted-foreground italic tracking-wide">
            &ldquo;蜀南竹海&rdquo;
          </p>
          <p className="mt-2 text-sm text-muted-foreground/60">
            촉남죽해
          </p>

          {/* Banner Image */}
          <div className="mt-8">
            {bannerImage ? (
              <div className="relative inline-block group">
                <Image
                  src={bannerImage}
                  alt="Banner"
                  width={600}
                  height={150}
                  className="max-h-32 w-auto object-contain rounded-sm border border-border/30"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => handleRemoveImage("banner")}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                className="border border-dashed border-border/50 hover:border-primary/50 px-6 py-4"
                onClick={() => handleAddImage("banner")}
              >
                <ImagePlus className="h-5 w-5 mr-2 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">배너 추가</span>
              </Button>
            )}
            <input
              id="banner-image-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageUpload(e, "banner")}
            />
          </div>
        </div>
      </section>
    </div>
  )
}
