import Modal from "@/components/modal";
import Profile from "@/components/profile";

export default async function ProfileModal({ params }: { params: { id: string } }) {
    const { id } = await params;
    return (
        <Modal>
            <div className="bg-white p-4 h-[100%] w-full overflow-y-scroll">
                <Profile id={id as string} />
            </div>
        </Modal>
    )
}