import axios from "axios";


export const checkIgn = async (ign: string) => {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await axios.get(`https://api.mojang.com/users/profiles/minecraft/${ign}`);
            resolve(response.data);
        } catch (error) {
            reject(error);
        }
    });
}