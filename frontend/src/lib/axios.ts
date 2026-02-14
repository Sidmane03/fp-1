// src/lib/axios.ts
import axios, { AxiosError } from "axios";
import { tokenStorage } from "./storage";

const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";


    export const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

// Attach token to every request if available
api.interceptors.request.use((config) => {
	const token = tokenStorage.get();
	if (token) {
		config.headers = config.headers ?? {};
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

// Optional: normalize errors
api.interceptors.response.use(
	(res) => res,
	(error: AxiosError<any>) => {
		const message =
			error.response?.data?.message ||
			error.message ||
			"Something went wrong";
		return Promise.reject(new Error(message));
	}
);