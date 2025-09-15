import { Container } from "@/components/container";
import Profile from "@/components/profile";

const ProfilePage = async ({ params, }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    return (
        <Container className="p-0">
            <div className="bg-white p-4 w-full rounded-md border border-dark">
                <Profile id={id as string} />
            </div>
        </Container>
    )
}

export default ProfilePage