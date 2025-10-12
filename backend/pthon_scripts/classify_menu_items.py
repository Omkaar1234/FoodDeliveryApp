import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from pymongo import MongoClient

# ---------------- CONFIG ----------------
MONGO_URI = "mongodb+srv://omkarkk004:nDa7h5MHUtuqRPL5@cluster0.8tofloz.mongodb.net/?retryWrites=true&w=majority"
DB_NAME = "test"               # Replace with your DB name
COLLECTION_NAME = "restaurants"  # Replace with your collection name

# Define your mood labels (must match your trained model)
MOODS = ["HAPPY", "SAD", "ANGRY", "RELAXED", "EXCITED"]  # Add more if your model has more classes

# ---------------- LOAD MODEL ----------------
model_path = "./emotion_model"  # Path to your downloaded model folder
tokenizer = AutoTokenizer.from_pretrained(model_path)
model = AutoModelForSequenceClassification.from_pretrained(model_path)
model.eval()  # Set model to evaluation mode

# ---------------- CONNECT TO MONGO ----------------
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
restaurants_col = db[COLLECTION_NAME]

# ---------------- PROCESS MENU ITEMS ----------------
restaurants = restaurants_col.find()

for restaurant in restaurants:
    menu = restaurant.get("menu", [])
    updated_menu = []

    for item in menu:
        name = item.get("name", "")
        if not name:
            continue  # Skip items with no name

        # Tokenize menu item name
        inputs = tokenizer(name, return_tensors="pt", truncation=True, padding=True)
        
        # Forward pass
        with torch.no_grad():
            outputs = model(**inputs)
            predicted_class = torch.argmax(outputs.logits, dim=1).item()
        
        # Assign mood
        item["mood"] = MOODS[predicted_class]
        updated_menu.append(item)

    # Update restaurant menu in DB
    restaurants_col.update_one(
        {"_id": restaurant["_id"]},
        {"$set": {"menu": updated_menu}}
    )
    print(f"✅ Updated menu for restaurant: {restaurant.get('name')}")

print("🎉 All menu items classified and updated successfully!")