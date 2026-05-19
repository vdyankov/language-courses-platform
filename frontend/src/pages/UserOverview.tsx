import {useEffect, useState} from "react";
import type {User} from "../../../types/User.ts";
import {CreateUserForm, UpdateUserForm, UserList} from "../components";

export const UserOverview = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [creatingUser, setCreatingUser] = useState<boolean>(false);
    const [userToBeUpdated, setUserToBeUpdated] = useState<User | null>(null); // undefined

    const fetchUsers = async () => {
        const response = await fetch('http://localhost:3000/users');
        const {data} = await response.json();
        setUsers(data);
    }

    useEffect(() => {
        fetchUsers();
    }, []);

    const toggleCreatingUser = () => {
        setCreatingUser(!creatingUser);
    }

    const refreshUsers = () => {
        fetchUsers();
        toggleCreatingUser();
        setUserToBeUpdated(null);

    }

    const updateUser = (user: User) => {
        setUserToBeUpdated(user);
    }

    const deleteUser = async (id: number) => {
        await fetch(`http://localhost:3000/users/${id}`, {
            method: "DELETE",
        });
        fetchUsers();
    }

    return (
        <>
            <h1>Users</h1>
            {creatingUser && <CreateUserForm refresh={refreshUsers}/>}

            {userToBeUpdated && <UpdateUserForm user={userToBeUpdated} refresh={refreshUsers} />}

            {!creatingUser && !userToBeUpdated && <UserList
                users={users}
                toggleCreatingUser={toggleCreatingUser}
                updateUser={updateUser}
                deleteUser={deleteUser}
            />
            }
        </>
    )
}