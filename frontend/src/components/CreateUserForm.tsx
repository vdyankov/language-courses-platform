import {useForm} from "react-hook-form";
import type {CreateUserDTO} from "../../../types/User.ts";
import type {FC} from "react";

interface CreateUserFormProps {
    refresh: VoidFunction;
}

export const CreateUserForm: FC<CreateUserFormProps> = ({ refresh }) => {
    const {
        handleSubmit,
        register,
        formState: {
            errors
        }
    } = useForm<CreateUserDTO>();

    const createUser = async (data: CreateUserDTO) => {
        await fetch(`http://localhost:3000/users`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
        refresh();
    }

    return (
        <form onSubmit={handleSubmit(createUser)}>
            <input {...register("name", {required: "Name is required"})} />
            {errors.name && <span>{errors.name.message}</span>}

            <input {...register("email", {required: "Email is required"})} />
            {errors.email && <span>{errors.email.message}</span>}

            <button type={'submit'}>Create User</button>
            <button onClick={refresh}>Cancel</button>
        </form>
    )
}