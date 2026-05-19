import {useForm} from "react-hook-form";
import type {CreateUserDTO, User} from "../../../types/User.ts";
import type {FC} from "react";

interface UpdateUserFormProps {
    user: User;
    refresh: VoidFunction;
}

export const UpdateUserForm: FC<UpdateUserFormProps> = ({ user, refresh }) => {
    const {
        handleSubmit,
        register,
        formState: {
            errors
        }
    } = useForm<CreateUserDTO>({
        defaultValues: {
            name: user.email,
            email: user.email
        }
    });

    const updateUser = async (data: CreateUserDTO) => {
        await fetch(`http://localhost:3000/users/${user.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
        refresh();
    }

    return (
        <form onSubmit={handleSubmit(updateUser)}>
            <input {...register("name", {required: "Name is required"})} />
            {errors.name && <span>{errors.name.message}</span>}

            <input {...register("email", {required: "Email is required"})} />
            {errors.email && <span>{errors.email.message}</span>}

            <button type={'submit'}>Update User</button>
            <button onClick={refresh}>Cancel</button>
        </form>
    )
}