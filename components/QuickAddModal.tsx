"use client"

import { ImagePlus, Lightbulb, Sparkles, NotebookText } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface QuickAddModalProps {
  isOpen: boolean
  onClose: () => void
}

export function QuickAddModal({ isOpen, onClose }: QuickAddModalProps) {
  const quickAddItems = [
    {
      id: "creative",
      label: "Add Creative",
      icon: ImagePlus,
      onClick: () => {
        // console.log("Add Creative clicked")
        onClose()
      }
    },
    {
      id: "insight",
      label: "Add Insight",
      icon: Lightbulb,
      onClick: () => {
        // console.log("Add Insight clicked")
        onClose()
      }
    },
    {
      id: "idea",
      label: "Add Idea",
      icon: Sparkles,
      onClick: () => {
        // console.log("Add Idea clicked")
        onClose()
      }
    },
    {
      id: "note",
      label: "Add Note",
      icon: NotebookText,
      onClick: () => {
        // console.log("Add Note clicked")
        onClose()
      }
    }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium text-gray-900 mb-6">
            Add New Entry
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          {quickAddItems.map((item) => (
            <button
              key={item.id}
              onClick={item.onClick}
              className="group flex flex-col items-center justify-center p-6 bg-[#f9f9f9] rounded-xl hover:bg-green-50 hover:scale-105 transition-all duration-200 ease-out"
            >
              <item.icon className="w-8 h-8 text-gray-600 group-hover:text-green-600 mb-3" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">
                {item.label}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-6">
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}