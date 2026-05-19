import type {User} from "../../../types/User.ts";
import type {FC} from "react";

interface UserListProps {
    users: User[];
    toggleCreatingUser: VoidFunction;
    updateUser: (user: User) => void;
    deleteUser: (id: number) => void;
}

export const UserList: FC<UserListProps> = ({
                                                users,
                                                toggleCreatingUser,
                                                updateUser,
                                                deleteUser
                                            }) => {
    return (
        <>
            {users.map((user) => (
                <p key={user.id}>
                    {user.name} {user.email}

                    <button onClick={() => {
                        updateUser(user)
                    }}>Update</button>

                    <button onClick={() => {
                        deleteUser(user.id)
                    }}>Delete</button>
                </p>
            ))}
            <button onClick={toggleCreatingUser}>Create new user</button>
        </>
    )
}