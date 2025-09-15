"use client"

import { Button } from "@/components/ui/button"
import { Container } from "./container"
import Search from "./search"
import MenuButton from "./menuButton"
import { CalendarPlus, GraduationCap, Logs, Recycle, UserPlus } from "lucide-react"
import AddUser from "./addUser"
import { Suspense, useContext, useEffect, useState } from "react"
import api from "@/lib/api"
import Link from "next/link"
import { NavigationMenu, NavigationMenuList } from "./ui/navigation-menu"
import AddGrade from "./addGrade"
import { GradesContext } from "@/context/gradeContext"
import AddMonth from "./addMonth"
import ConfirmDialog from "./confirmDialog"
import { toast } from "sonner"
import { LoadingLinear } from "./progress"
import { useRouter } from "next/navigation"


const Navbar = () => {
  const [openAddUser, setOpenAddUser] = useState(false);
  const [openAddGrade, setOpenAddGrade] = useState(false);
  const [openAddMonth, setOpenAddMonth] = useState(false);
  const gradeContext = useContext(GradesContext);
  if (!gradeContext) throw new Error("Navbar لازم يكون جوا GradeProvider");
  const { grades, setGrades } = gradeContext;
  const [openDialog, setOpenDialog] = useState(false)
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleResetClick = async () => {
    setLoading(true);
    try {
      const response = await api.delete(`/delete-all/`);
      if (response.status === 204 || response.status === 200 || response.status === 201) {
        {
          toast.success("تمت العملية بنجاح !");
          router.push("/");
        }
      }
    } catch {
      toast.error("لقد حدث خطاء");
    } finally {
      setLoading(false);
    }
  }

  const navBarItems = {
    dailyFollowUp: [
      { title: "إضافة", icon: <CalendarPlus />, action: () => setOpenAddUser(true) },
      { title: "إسترجاع", icon: <Logs />, action: () => setOpenAddGrade(true) },
    ],
    add: [
      { title: "إضافة طالب", icon: <UserPlus />, action: () => setOpenAddUser(true) },
      { title: "إضافة صف دراسي", icon: <GraduationCap />, action: () => setOpenAddGrade(true) },
      { title: "إضافة شهر دراسي", icon: <CalendarPlus />, action: () => setOpenAddMonth(true) },
    ],
    grades: grades.map((grade) => ({
      id: grade.id,
      title: grade.level,
      link: `/grades/${grade.id}`,
    })),
  }

  useEffect(() => {
    getGrades();
  }, []);


  const getGrades = async () => {
    try {
      const response = await api.get("/grades/");
      setGrades(response.data);
    } catch {
      toast.error("لقد حدث خطأ");
    }
  };

  const deleteGrade = (id: string) => {
    api.delete(`/grades/${id}/`)
      .then(() => {
        getGrades();
        toast.success("تم حذف الصف الدراسي بنجاح !");
      })
      .catch(() => {
        toast.error("لقد حدث خطأ لم يتم حذف الصف الدراسي");
      });
  };

  return (
    <>
      <LoadingLinear loading={loading} />
      <header className="fixed z-50 top-0 left-0 w-full bg-transparent">
        <Container className="flex items-center bg-white justify-between py-4 rounded-md border border-dark mx-auto mt-2">
          <Suspense fallback={<div>Loading...</div>}>
            <Search style={{ fontSize: "1rem" }} className="w-1/2 font-semibold" />
          </Suspense>

          <div dir="rtl" className="flex justify-center align-items-center gap-1.5">
            <Button variant="outline" className="p-0">
              <Link href="/" className="w-full text-center py-4 px-4">الرئيسية</Link>
            </Button>
            <Button variant="outline">
              <Link href="/daily-follow-up" className="w-full text-center py-4">متابعة يومية</Link>
            </Button>
            <Button variant="outline">
              <Link href="/payments" className="w-full text-center py-4">المصاريف</Link>
            </Button>
            <Button variant="outline">
              <Link href="/quizzes" className="w-full text-center py-4">امتحانات</Link>
            </Button>

            <NavigationMenu viewport={false}>
              <NavigationMenuList>
                <MenuButton
                  title={"الصفوف"}
                  items={navBarItems.grades}
                  className="border border-dark rounded-md"
                  deleteAction={deleteGrade}
                />
                <MenuButton
                  title={"إضافة"}
                  items={navBarItems.add}
                  className="border border-dark rounded-md"
                />
              </NavigationMenuList>
            </NavigationMenu>

            <Button variant="destructive" onClick={() => setOpenDialog(true)}>
              <Recycle className="font-bold" />
            </Button>
          </div>
        </Container>
      </header>

      <AddUser open={openAddUser} onOpenChange={setOpenAddUser} />
      <AddGrade open={openAddGrade} onOpenChange={setOpenAddGrade} />
      <AddMonth open={openAddMonth} onOpenChange={setOpenAddMonth} />

      <ConfirmDialog
        dir="rtl"
        open={openDialog}
        onOpenChange={setOpenDialog}
        title="تأكيد الحذف"
        description={`لاحظ بمجرد الحذف سيتم حذف كل البيانات المرتبطة بهذا النظام.`}
        confirmText="حذف"
        cancelText="إلغاء"
        protectedDialog={true}
        onConfirm={() => {
          handleResetClick()
        }}
      />
    </>
  )
}

export default Navbar