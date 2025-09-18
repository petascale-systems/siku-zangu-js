import {useEffect, useState} from "react";
import {User} from "@siku-zangu/core";

export function useUserById(id?: string) {
    const [user, setUser] = useState<User>();

    useEffect(() => {
        if (!id) return

        fetch(`/api/users/${id}`)
            .then(res => res.json())
            .then(user => setUser(user as User));
    }, [id]);
    return {user}
}