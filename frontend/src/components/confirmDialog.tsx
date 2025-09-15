"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input" // لو مش موجود عندك ضيفه من shadcn/ui

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  dir?: string
  protectedDialog?: boolean
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onOpenChange,
  title = "تأكيد",
  description = "هل أنت متأكد من هذا الإجراء؟",
  confirmText = "تأكيد",
  cancelText = "إلغاء",
  onConfirm,
  dir,
  protectedDialog = false,
}) => {
  const [showPasswordInput, setShowPasswordInput] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const correctPass = process.env.NEXT_PUBLIC_PROTECT_PASS

  const handleConfirmClick = () => {
    if (protectedDialog) {
      setShowPasswordInput(true)
    } else {
      onConfirm()
      onOpenChange(false)
    }
  }

  const handlePasswordConfirm = () => {
    if (password === correctPass) {
      onConfirm()
      onOpenChange(false)
      setPassword("")
      setError("")
      setShowPasswordInput(false)
    } else {
      setError("كلمة المرور غير صحيحة")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir={dir}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription dir={dir}>{description}</DialogDescription>
        </DialogHeader>

        {showPasswordInput && (
          <div className="flex flex-col gap-2 my-4">
            <Input
              type="password"
              placeholder="أدخل كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {cancelText}
          </Button>
          {!showPasswordInput ? (
            <Button variant="destructive" onClick={handleConfirmClick}>
              {confirmText}
            </Button>
          ) : (
            <Button variant="destructive" onClick={handlePasswordConfirm}>
              تأكيد الباسورد
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ConfirmDialog
