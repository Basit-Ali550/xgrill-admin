"use client";
import { useState, useEffect, useMemo } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select"; 
import AddStaffModal from "@/components/staff/AddStaffModal";
import { Search, Edit2, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export default function StaffPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, user: null });
  const [globalFilter, setGlobalFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/v1/users/staff");
      if (res.success) {
        setData(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch staff:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleStaffAdded = (newStaff) => {
    setData((prev) => [newStaff, ...prev]);
  };

  const handleStaffUpdated = (updatedStaff) => {
    setData((prev) => prev.map((u) => (u.id === updatedStaff.id ? updatedStaff : u)));
    setEditingUser(null);
  };

  const confirmDelete = async () => {
    if (!deleteDialog.user) return;
    try {
      await api.delete(`/api/v1/users/${deleteDialog.user.id}`);
      setData((prev) => prev.filter((u) => u.id !== deleteDialog.user.id));
      setDeleteDialog({ isOpen: false, user: null });
    } catch (err) {
      alert("Failed to delete user: " + err.message);
    }
  };

  const handleDeleteClick = (user) => {
    setDeleteDialog({ isOpen: true, user });
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "DELIVERY_BOY":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "CHEF":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "WAITER":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "RECEPTIONIST":
        return "bg-pink-500/20 text-pink-400 border-pink-500/30";
      case "USER":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const columns = useMemo(() => [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const member = row.original;
        return (
          <div className="flex items-center gap-3">
             {member.profileImage ? (
               <img
                 src={member.profileImage}
                 alt={member.name}
                 className="h-8 w-8 rounded-full object-cover border border-gray-700"
               />
             ) : (
               <div className="h-8 w-8 rounded-full bg-linear-to-br from-orange-400 to-red-600 flex items-center justify-center text-white font-bold text-xs">
                  {member.name?.charAt(0).toUpperCase() || "?"}
               </div>
             )}
             <div>
               <div className="font-medium text-white">{member.name}</div>
               <div className="text-xs text-gray-500">{member.email}</div>
             </div>
          </div>
        );
      }
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("role");
        return (
           <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getRoleBadgeColor(role)}`}>
             {role.replace("_", " ")}
           </span>
        );
      }
    },
    {
       accessorKey: "phone",
       header: "Contact",
       cell: ({ row }) => <span className="text-gray-400">{row.getValue("phone") || "-"}</span>
    },
    {
       accessorKey: "createdAt",
       header: "Joined",
       cell: ({ row }) => <span className="text-gray-400">{new Date(row.getValue("createdAt")).toLocaleDateString()}</span>
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex gap-2 justify-end">
             <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                onClick={() => setEditingUser(user)}
             >
               <Edit2 size={16} />
             </Button>
             <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                onClick={() => handleDeleteClick(user)}
             >
               <Trash2 size={16} />
             </Button>
          </div>
        );
      },
      enableSorting: false,
    }
  ], []);

  const filteredData = useMemo(() => {
    let d = data;
    if (roleFilter !== "ALL") {
       d = d.filter(item => item.role === roleFilter);
    }
    if (globalFilter) {
       const lowerFilter = globalFilter.toLowerCase();
       d = d.filter(item => 
          item.name?.toLowerCase().includes(lowerFilter) || 
          item.email?.toLowerCase().includes(lowerFilter) ||
          item.phone?.includes(lowerFilter)
       );
    }
    return d;
  }, [data, roleFilter, globalFilter]);


  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <span>👥</span> Staff Management
              <Badge variant="secondary" className="ml-2 text-sm font-normal">
                {filteredData.length} members
              </Badge>
            </CardTitle>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-orange-500 hover:bg-orange-600"
            >
              + Add Staff
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          
           {/* Filters */}
           <div className="flex flex-col md:flex-row gap-4 mb-6 p-6 pb-0">
              <div className="relative flex-1 max-w-sm">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                 <Input 
                   placeholder="Search staff..." 
                   className="pl-9 bg-gray-800 border-gray-700"
                   value={globalFilter}
                   onChange={(e) => setGlobalFilter(e.target.value)}
                 />
              </div>
              <div className="w-full md:w-48">
                <select 
                  className="w-full h-10 rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                   <option value="ALL">All Roles</option>
                   <option value="ADMIN">Admin</option>
                   <option value="DELIVERY_BOY">Delivery Boy</option>
                   <option value="WAITER">Waiter</option>
                   <option value="CHEF">Chef</option>
                   <option value="RECEPTIONIST">Receptionist</option>
                   <option value="USER">User</option>
                 </select>
              </div>
           </div>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <DataTable columns={columns} data={filteredData} />
          )}
        </CardContent>
      </Card>

      <AddStaffModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleStaffAdded}
      />

       {editingUser && (
         <AddStaffModal
           isOpen={true}
           onClose={() => setEditingUser(null)}
           onAdd={handleStaffUpdated}
           initialData={editingUser}
           isEditMode={true}
         />
       )}

       <ConfirmDialog
         isOpen={deleteDialog.isOpen}
         onClose={() => setDeleteDialog({ isOpen: false, user: null })}
         onConfirm={confirmDelete}
         title="Delete User"
         message={`Are you sure you want to delete ${deleteDialog.user?.name}? This action cannot be undone.`}
         confirmText="Delete User"
         variant="danger"
       />
    </>
  );
}
