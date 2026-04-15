import axios from "axios";
import { useAuthInfo } from '@propelauth/react';
import { useEffect, useRef } from 'react';


export default function AxiosWrapper({ children }) {

	const { tokens, isLoggedIn } = useAuthInfo();

	const tokensRef = useRef(tokens);
	const isLoggedInRef = useRef(isLoggedIn);

	useEffect(() => {
		tokensRef.current = tokens;
		isLoggedInRef.current = isLoggedIn;
	}, [tokens, isLoggedIn]);

	useEffect(() => {
		const requestInterceptor = axios.interceptors.request.use(
			async function (config) {
				if (isLoggedInRef.current && tokensRef.current) {
					try {
						const accessToken = await tokensRef.current.getAccessToken();
						config.headers = {
							...config.headers,
							Authorization: `Bearer ${accessToken}`,
						};
					} catch (error) {
						console.error("Failed to get access token:", error);
					}
				}
				return config;
			},
			function (error) {
				return Promise.reject(error);
			}
		);

		const responseInterceptor = axios.interceptors.response.use(
			function (response) {
				return response;
			},
			async function (error) {
				const originalRequest = error.config;
				if (
					error.response &&
					error.response.status === 401 &&
					!originalRequest._retry &&
					isLoggedInRef.current &&
					tokensRef.current
				) {
					originalRequest._retry = true;
					try {
						const accessToken = await tokensRef.current.getAccessToken();
						originalRequest.headers.Authorization = `Bearer ${accessToken}`;
						return axios(originalRequest);
					} catch (refreshError) {
						return Promise.reject(refreshError);
					}
				}
				return Promise.reject(error);
			}
		);

		return () => {
			axios.interceptors.request.eject(requestInterceptor);
			axios.interceptors.response.eject(responseInterceptor);
		};
	}, []);

	return (
		<div className="axios-wrapper">
			{children}
		</div>
	);
}
