"use client";

import { useState } from "react";
import { Users, Trash2, Pencil, Plus } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RequireAuth } from "@/components/auth/require-auth";
import { useApi, useMutation } from "@/hooks/use-api";
import { UsersAPI } from "@/lib/api";
import type { User, Role } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const navItems = [
  { href: "/admin", label: "لوحة التحكم", icon: Users },
  { href: "/admin/users", label: "المستخدمون", icon: Users },
];

function UsersPage() {
  const {
    data: users,
    isLoading,
    error,
    refetch,
  } = useApi<User[]>((token) => UsersAPI.list(token), []);
  const { mutate: remove } = useMutation<{ deleted: boolean }, string>(
    (id, token) => UsersAPI.remove(id, token!),
  );
  const { mutate: createUser, isLoading: creating } = useMutation<User, any>(
    (body, token) => UsersAPI.create(body, token),
  );
  const { mutate: updateUser, isLoading: updating } = useMutation<User, any>(
    ({ id, ...body }, token) => UsersAPI.update(id, body, token),
  );

  // حالة المودال
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // نموذج الإضافة
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer" as Role,
    phone: "",
  });

  // نموذج التعديل
  const [editUser, setEditUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer" as Role,
    phone: "",
  });

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المستخدم؟")) return;
    await remove(id);
    refetch();
  };

  const handleAddUser = async () => {
    try {
      await createUser(newUser);
      setIsAddModalOpen(false);
      setNewUser({
        name: "",
        email: "",
        password: "",
        role: "customer",
        phone: "",
      });
      refetch();
    } catch (err) {
      // error handled by useMutation
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;
    try {
      await updateUser({ id: selectedUser.id, ...editUser });
      setIsEditModalOpen(false);
      setSelectedUser(null);
      refetch();
    } catch (err) {
      // error handled by useMutation
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setEditUser({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      phone: user.phone || "",
    });
    setIsEditModalOpen(true);
  };

  const roleBadge: Record<User["role"], string> = {
    admin: "bg-violet-100 text-violet-700",
    hall_owner: "bg-sky-100 text-sky-700",
    customer: "bg-emerald-100 text-emerald-700",
  };

  // دالة مساعدة لتحديث حالة النموذج
  const handleNewUserChange = (field: string, value: string) => {
    setNewUser((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditUserChange = (field: string, value: string) => {
    setEditUser((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <DashboardShell
      navItems={navItems}
      userName="المشرف"
      userRoleLabel="إدارة المستخدمين"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-ink">المستخدمون</h2>
        <Button
          className="rounded-full"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
          إضافة مستخدم
        </Button>
      </div>
      {isLoading && (
        <p className="text-sm text-muted-foreground">جارٍ التحميل...</p>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="overflow-hidden rounded-[1.75rem] border border-border bg-white shadow-card">
        <table className="w-full text-right text-sm">
          <thead className="bg-secondary/60 text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-semibold">الاسم</th>
              <th className="px-5 py-3 font-semibold">البريد</th>
              <th className="px-5 py-3 font-semibold">الدور</th>
              <th className="px-5 py-3 font-semibold">إجراء</th>
            </tr>
          </thead>
          <tbody>
            {(users ?? []).map((u) => (
              <tr key={u.id} className="border-t border-border">
                <td className="px-5 py-3 font-semibold text-ink">{u.name}</td>
                <td className="px-5 py-3 text-ink/80">{u.email}</td>
                <td className="px-5 py-3">
                  <Badge className={roleBadge[u.role]}>{u.role}</Badge>
                </td>
                <td className="px-5 py-3">
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="rounded-full"
                      onClick={() => openEditModal(u)}
                    >
                      <Pencil className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="rounded-full"
                      onClick={() => handleDelete(u.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* مودال إضافة مستخدم */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>إضافة مستخدم جديد</DialogTitle>
            <DialogDescription>أدخل بيانات المستخدم الجديد</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-name" className="text-right">
                الاسم
              </Label>
              <Input
                id="add-name"
                value={newUser.name}
                onChange={(e) => handleNewUserChange("name", e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-email" className="text-right">
                البريد
              </Label>
              <Input
                id="add-email"
                type="email"
                value={newUser.email}
                onChange={(e) => handleNewUserChange("email", e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-password" className="text-right">
                كلمة المرور
              </Label>
              <Input
                id="add-password"
                type="password"
                value={newUser.password}
                onChange={(e) =>
                  handleNewUserChange("password", e.target.value)
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-role" className="text-right">
                الدور
              </Label>
              <Select
                value={newUser.role}
                onValueChange={(value) =>
                  handleNewUserChange("role", value as Role)
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="اختر الدور" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">مدير</SelectItem>
                  <SelectItem value="hall_owner">مالك قاعة</SelectItem>
                  <SelectItem value="customer">عميل</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-phone" className="text-right">
                الهاتف
              </Label>
              <Input
                id="add-phone"
                value={newUser.phone}
                onChange={(e) => handleNewUserChange("phone", e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleAddUser} disabled={creating}>
              {creating ? "جاري الإضافة..." : "إضافة"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* مودال تعديل مستخدم */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>تعديل المستخدم</DialogTitle>
            <DialogDescription>قم بتعديل بيانات المستخدم</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                الاسم
              </Label>
              <Input
                id="edit-name"
                value={editUser.name}
                onChange={(e) => handleEditUserChange("name", e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">
                البريد
              </Label>
              <Input
                id="edit-email"
                type="email"
                value={editUser.email}
                onChange={(e) => handleEditUserChange("email", e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-password" className="text-right">
                كلمة المرور (اختياري)
              </Label>
              <Input
                id="edit-password"
                type="password"
                value={editUser.password}
                onChange={(e) =>
                  handleEditUserChange("password", e.target.value)
                }
                className="col-span-3"
                placeholder="اترك فارغاً إذا لا تريد التغيير"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-role" className="text-right">
                الدور
              </Label>
              <Select
                value={editUser.role}
                onValueChange={(value) =>
                  handleEditUserChange("role", value as Role)
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="اختر الدور" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">مدير</SelectItem>
                  <SelectItem value="hall_owner">مالك قاعة</SelectItem>
                  <SelectItem value="customer">عميل</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-phone" className="text-right">
                الهاتف
              </Label>
              <Input
                id="edit-phone"
                value={editUser.phone}
                onChange={(e) => handleEditUserChange("phone", e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleEditUser} disabled={updating}>
              {updating ? "جاري التحديث..." : "تحديث"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}

export default function Page() {
  return (
    <RequireAuth role="admin">
      <UsersPage />
    </RequireAuth>
  );
}
