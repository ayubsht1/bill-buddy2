"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  AddEditTransactionModal,
  PersonalExpense,
  TransactionType,
  CATEGORY_OPTIONS,
} from "@/components/personal/AddEditTransactionModal";

const INITIAL_DUMMY_DATA: PersonalExpense[] = [
  {
    id: 1,
    title: "Client Project Payment",
    amount: "1200.00",
    transaction_type: "INCOME",
    category: "FREELANCE",
    date: "2026-08-28",
  },
  {
    id: 2,
    title: "Grocery Shopping",
    amount: "84.50",
    transaction_type: "EXPENSE",
    category: "FOOD",
    date: "2026-08-27",
  },
  {
    id: 3,
    title: "Monthly Salary",
    amount: "3500.00",
    transaction_type: "INCOME",
    category: "SALARY",
    date: "2026-08-25",
  },
  {
    id: 4,
    title: "Internet & Utility Bill",
    amount: "65.00",
    transaction_type: "EXPENSE",
    category: "UTILITIES",
    date: "2026-08-20",
  },
];

// Explicitly typed animation variants to resolve TypeScript error
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemFadeUp: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

const listItemVariants: Variants = {
  hidden: { opacity: 0, height: 0, y: -10, scale: 0.98 },
  visible: {
    opacity: 1,
    height: "auto",
    y: 0,
    scale: 1,
    transition: { duration: 0.25, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    height: 0,
    scale: 0.95,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

export default function PersonalMoneyTracker() {
  const [transactions, setTransactions] = useState<PersonalExpense[]>(INITIAL_DUMMY_DATA);
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<PersonalExpense | null>(null);

  const handleOpenCreateModal = () => {
    setEditingRecord(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: PersonalExpense) => {
    setEditingRecord(item);
    setIsModalOpen(true);
  };

  const handleModalSubmit = (payload: {
    title: string;
    amount: number;
    transaction_type: TransactionType;
    category: string;
  }) => {
    if (editingRecord) {
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === editingRecord.id
            ? {
                ...t,
                ...payload,
                amount: payload.amount.toString(),
              }
            : t
        )
      );
    } else {
      const newEntry: PersonalExpense = {
        id: Date.now(),
        title: payload.title,
        amount: payload.amount.toString(),
        transaction_type: payload.transaction_type,
        category: payload.category,
        date: new Date().toISOString().split("T")[0],
      };
      setTransactions((prev) => [newEntry, ...prev]);
    }
  };

  const handleDelete = (id: number) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === "ALL" || t.transaction_type === typeFilter;
      const matchesCategory = categoryFilter === "ALL" || t.category === categoryFilter;

      return matchesSearch && matchesType && matchesCategory;
    });
  }, [transactions, searchQuery, typeFilter, categoryFilter]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-7xl mx-auto p-6 md:p-10 space-y-8 text-foreground"
    >
      {/* Header Section */}
      <motion.div
        variants={itemFadeUp}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Money Tracker</h1>
          <p className="text-base text-muted-foreground mt-1">
            Manage your personal income and expenses (Demo mode).
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={handleOpenCreateModal}
            size="lg"
            className="shrink-0 gap-2 text-base px-5 py-6 shadow-md transition-shadow hover:shadow-lg"
          >
            <Plus className="h-5 w-5" />
            Add Transaction
          </Button>
        </motion.div>
      </motion.div>

      {/* Filter Section */}
      <motion.div variants={itemFadeUp}>
        <Card className="p-5 bg-card border-border shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            <div className="sm:col-span-5 relative">
              <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-12 text-base transition-all focus:ring-2"
              />
            </div>

            <div className="sm:col-span-3">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full h-12 text-base">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="INCOME">Income Only</SelectItem>
                  <SelectItem value="EXPENSE">Expense Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-3">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full h-12 text-base">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Categories</SelectItem>
                  {CATEGORY_OPTIONS.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-1 flex justify-end">
              <motion.div whileHover={{ rotate: 15 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setTypeFilter("ALL");
                    setCategoryFilter("ALL");
                    setSearchQuery("");
                  }}
                  className="h-12 w-12"
                  title="Reset Filters"
                >
                  <Filter className="h-5 w-5 text-muted-foreground" />
                </Button>
              </motion.div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Transaction List Card */}
      <motion.div variants={itemFadeUp}>
        <Card className="border-border shadow-xs">
          <CardHeader className="p-6 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold">Logged Entries</CardTitle>
              <motion.span
                key={filteredTransactions.length}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-sm font-medium text-muted-foreground"
              >
                {filteredTransactions.length} items
              </motion.span>
            </div>
          </CardHeader>
          <CardContent className="p-0 sm:p-6 pt-0">
            {filteredTransactions.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-16 text-center text-muted-foreground text-base"
              >
                No transactions match your current filters.
              </motion.div>
            ) : (
              <div className="divide-y divide-border overflow-hidden">
                <AnimatePresence mode="popLayout" initial={false}>
                  {filteredTransactions.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      variants={listItemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="flex items-center justify-between p-4 sm:p-5 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className={`p-3 rounded-full shrink-0 transition-colors ${
                            item.transaction_type === "INCOME"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-destructive/10 text-destructive"
                          }`}
                        >
                          {item.transaction_type === "INCOME" ? (
                            <ArrowDownLeft className="h-5 w-5" />
                          ) : (
                            <ArrowUpRight className="h-5 w-5" />
                          )}
                        </motion.div>
                        <div className="min-w-0">
                          <p className="font-semibold text-base truncate text-foreground">
                            {item.title}
                          </p>
                          <div className="flex items-center gap-2.5 mt-1">
                            <Badge variant="outline" className="text-xs uppercase py-0.5 px-2 font-medium">
                              {item.category}
                            </Badge>
                            {item.date && (
                              <span className="text-sm text-muted-foreground">{item.date}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <span
                          className={`font-mono text-base font-bold ${
                            item.transaction_type === "INCOME"
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-foreground"
                          }`}
                        >
                          {item.transaction_type === "INCOME" ? "+" : "-"}
                          ${Number(item.amount).toFixed(2)}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <motion.div whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEditModal(item)}
                              className="h-9 w-9 text-muted-foreground hover:text-foreground"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(item.id)}
                              className="h-9 w-9 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <AddEditTransactionModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        editingRecord={editingRecord}
        onSubmit={handleModalSubmit}
      />
    </motion.div>
  );
}