import cv2
from ultralytics import YOLO
import numpy as np
from supabase import create_client, Client
import os
import threading

# Load the model
model = YOLO("yolo_model.pt")

url: str = "https://winfntscvpqbhdkberxo.supabase.co"
key: str = "sb_publishable_4Q9eVWNs0Mr1ZMtENydjEA_x0bVSrUd"
supabase: Client = create_client(url, key)

# Define the class names
class_names = [
    'Al abd Cookies', 'Big Ships', 'Biskrem', 'California Garden Beans',
    'Fine', 'Freska', 'Hohos', 'Lifebuoy', 'Maxtella', 'Milk',
    'Nescafe Gold', 'PLYMS Tuna', 'Pantene Oil Replacement', 
    'RedBull', 'Rhodes Cheese', 'Shampoo Herbal Essences',
    'Supermi indomie', 'Toffifee', 'V Cola', 'Zabado',
    'bless conditioner', 'cadbury dairy milk chocolate',
    'herbal essences conditioner', 'juhayna mix chocolate',
    'nivea men deodorant', 'oreo original', 'pepsi',
    'pyrosol', 'suntop', 'tiger chilli and lemon'
]

def add_to_cart(class_name):
    # Add to cart in database
    try:
        product_response = supabase.table("product").select("productid").eq("name", class_name).execute()
        if product_response.data:
            productid = product_response.data[0]["productid"]
            cart_response = supabase.table("cartproduct").select("quantity").eq("cartid", 1).eq("productid", productid).execute()
            if cart_response.data:
                quantity = cart_response.data[0]["quantity"]
                supabase.table("cartproduct").update({"quantity": quantity + 1}).eq("cartid", 1).eq("productid", productid).execute()
            else:
                supabase.table("cartproduct").insert({"cartid": 1, "productid": productid, "quantity": 1}).execute()
        print(f"Added {class_name} to cart")
    except Exception as e:
        print(f"Error adding to cart: {e}")

def remove_from_cart(class_name):
    # Remove from cart in database
    try:
        product_response = supabase.table("product").select("productid").eq("name", class_name).execute()
        if product_response.data:
            productid = product_response.data[0]["productid"]
            cart_response = supabase.table("cartproduct").select("quantity").eq("cartid", 1).eq("productid", productid).execute()
            if cart_response.data:
                quantity = cart_response.data[0]["quantity"]
                if quantity > 1:
                    supabase.table("cartproduct").update({"quantity": quantity - 1}).eq("cartid", 1).eq("productid", productid).execute()
                else:
                    supabase.table("cartproduct").delete().eq("cartid", 1).eq("productid", productid).execute()
        print(f"Removed {class_name} from cart")
    except Exception as e:
        print(f"Error removing from cart: {e}")

cap = cv2.VideoCapture(0)

frame_height = 480  
frame_center_y = frame_height // 2  

previous_positions = {}

while True:
    ret, frame = cap.read()
    if not ret:
        print("Failed to grab frame")
        break

    results = model.track(frame, persist=True, verbose=False)

    cv2.line(frame, (0, frame_center_y), (frame.shape[1], frame_center_y), (0, 255, 0), 2)

    if results[0].boxes.id is not None:
        boxes = results[0].boxes.xyxy.cpu().numpy() 
        confidences = results[0].boxes.conf.cpu().numpy() 
        class_ids = results[0].boxes.cls.cpu().numpy()
        track_ids = results[0].boxes.id.cpu().numpy()

        for i in range(len(boxes)):
            if confidences[i] > 0.3:  
                x1, y1, x2, y2 = boxes[i]
                cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), (0, 255, 0), 2)
                
                class_id = int(class_ids[i])
                track_id = int(track_ids[i])
                
                if class_id < len(class_names):
                    class_name = class_names[class_id]
                    cv2.putText(frame, f"{class_name} ID:{track_id} Conf: {confidences[i]:.2f}", 
                                (int(x1), int(y1) - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)
                    
                    center_y = (y1 + y2) / 2
                    
                    # Calculate direction
                    if track_id in previous_positions:
                        prev_y = previous_positions[track_id]
                        
                        if center_y > prev_y:  # moving down
                            direction = "in"
                            if prev_y < frame_center_y and center_y >= frame_center_y:
                                threading.Thread(target=add_to_cart, args=(class_name,)).start()

                        elif center_y < prev_y:  # moving up
                            direction = "out"
                            if prev_y > frame_center_y and center_y <= frame_center_y:
                                threading.Thread(target=remove_from_cart, args=(class_name,)).start()
                        else:
                            direction = "stationary"
                    else:
                        direction = "unknown"
                    
                    previous_positions[track_id] = center_y  
                    
                    cv2.putText(frame, f"Direction: {direction}", 
                                (int(x1), int(y1) - 30), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)

    cv2.imshow("Real-Time Object Detection", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
