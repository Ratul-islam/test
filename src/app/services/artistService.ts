/* eslint-disable @typescript-eslint/no-explicit-any */
import {FETCH, ROUTES} from './fetch';

export const fetchArtists = async ({ searchParams }: { searchParams?: Record<string, string | number> }) => {
    try {
        const response:any = await FETCH.get({ url: ROUTES.ARTISTS, searchParams })

        return [response, null]
    } catch (error) {
        return [null, error]
    }
}

export const fetchSpecialisations = async ({ searchParams }: { searchParams?: Record<string, string | any> }) => {
    try {
        const response:any = await FETCH.get({ url: `${ROUTES.ARTISTS}/specialization`, searchParams })

        return [response, null]
    } catch (error) {
        return [null, error]
    }
}

export const createOrUpdateArtist = async ({body = {}, id = null}) => {
    try {
        let response:any
        if(id) {
            response = await FETCH.update({ url: ROUTES.ARTISTS, id, body, isFormData:false })
        } else {
            response = await FETCH.post({ url: ROUTES.ARTISTS, body, isFormData:false })
        }

        return [response, null]
    } catch (error: any) {
        // Extract more detailed error information
        let errorData = error;
        if (error.response) {
            // The server responded with a status code outside the 2xx range
            errorData = {
                status: error.response.status,
                message: error.response.data?.message || 'Server error',
                data: error.response.data
            };
        } else if (error.request) {
            // The request was made but no response was received
            errorData = {
                message: 'No response received from server'
            };
        } else {
            // Something happened in setting up the request
            errorData = {
                message: error.message
            };
        }
        return [null, errorData]
    }
}