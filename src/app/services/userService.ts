/* eslint-disable @typescript-eslint/no-explicit-any */
import {FETCH, ROUTES} from './fetch';

export const fetchUserSession = async ({ searchParams }: { searchParams?: Record<string, string | number> }) => {
    try {
        const response:any = await FETCH.get({ url: ROUTES.ADMIN, searchParams })

        return [response, null]
    } catch (error) {
        return [null, error]
    }
}

export const updateAdminProfile = async ({body}: any) => {
    try {
        const response:any = await FETCH.update({ url: ROUTES.ADMIN, body, isFormData:true });

        return [response, null]
    } catch (error) {
        return [null, error]
    }
}