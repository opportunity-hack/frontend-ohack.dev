import axios from "axios";
import { useAuthInfo } from '@propelauth/react';


export default function AxiosWrapper({ children }) {

	const { user, accessToken } = useAuthInfo();

	axios.interceptors.request.use(function (config) {
	    // Add bearer auth
	    if (user) {
	    	config.headers = {
	        ...config.headers,
	        Authorization: `Bearer ${accessToken}`,
	      };
		  
		  }
	    return config;
	  }, function (error) {
	    let result = undefined;
	    if (axios.isAxiosError(error) && error.response) {
        result = error.response;
      }

      result = error.message;
	    return Promise.reject(result);
	  });

	return (
    <div className="axios-wrapper">
      {children}
    </div>
  );
}