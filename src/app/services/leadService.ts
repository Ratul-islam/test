/* eslint-disable @typescript-eslint/no-explicit-any */
import {FETCH, ROUTES} from './fetch';

export const fetchLeads = async ({ searchParams }: { searchParams?: Record<string, string | number> }) => {
    try {
        const response:any = await FETCH.get({ url: ROUTES.LEADS, searchParams })

        return [response, null]
    } catch (error) {
        return [null, error]
    }
}

export const createLead = async ({body = {}}) => {
    try {
        const response:any = await FETCH.post({ url: ROUTES.LEADS, body, isFormData:false })

        return [response, null]
    } catch (error) {
        return [null, error]
    }
}