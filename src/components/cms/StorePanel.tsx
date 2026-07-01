'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Warehouse, PackageCheck, ArrowDownToLine, FileBarChart, Construction } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const TABS = [
  { id: 'inventory', label: 'Inventory Management', icon: Warehouse },
  { id: 'material-request', label: 'Material Request', icon: PackageCheck },
  { id: 'goods-receipt', label: 'Goods Receipt', icon: ArrowDownToLine },
  { id: 'stock-reports', label: 'Stock Reports', icon: FileBarChart },
]

export function StorePanel() {
  const [activeTab, setActiveTab] = useState('inventory')

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md shadow-amber-500/20">
          <Warehouse className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Store Management</h1>
          <p className="text-sm text-muted-foreground">Manage inventory, material requests, and goods receipt</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50 p-1 h-auto flex-wrap gap-1">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm gap-1.5 px-3 py-1.5"
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map((tab) => (
          <TabsContent key={tab.id} value={tab.id}>
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-20">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="text-center"
                >
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 flex items-center justify-center mx-auto mb-6">
                    <Construction className="h-10 w-10 text-amber-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{tab.label}</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    This module is coming soon. Full {tab.label.toLowerCase()} functionality will be available in the next update.
                  </p>
                </motion.div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}