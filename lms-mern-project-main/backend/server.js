import app from "./app.js";
const PORT = process.env.PORT;
import {v2 as cloudinary} from 'cloudinary';
import Razorpay from "razorpay"; 
         
// cloudinary configuration
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

// razorpay  
export const razorpay = {
    subscriptions: {
        create: async () => ({
            id: 'mock_sub_id',
            status: 'active'
        }),
        cancel: async () => ({
            status: 'cancelled'
        }),
        all: async () => ({
            items: [
                {
                    id: 'mock_sub_id',
                    status: 'active'
                }
            ]
        })
    }
};


app.listen(PORT, () => {
    console.log(`server started at http://localhost:${PORT}`);
})