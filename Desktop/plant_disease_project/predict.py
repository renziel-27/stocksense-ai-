import tensorflow as tf
import numpy as np
import json
from tensorflow.keras.preprocessing import image

IMG_SIZE = 224

# Load model
model = tf.keras.models.load_model("plantdoc_model_tf2_m2.h5")

# Load labels
with open("labels.json", "r") as f:
    labels = json.load(f)
    labels = {int(k): v for k, v in labels.items()}

def predict_image(img_path):
    img = image.load_img(img_path, target_size=(IMG_SIZE, IMG_SIZE))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)

    # ⭐ IMPORTANT: Preprocess image for MobileNetV2
    img_array = tf.keras.applications.mobilenet_v2.preprocess_input(img_array)

    predictions = model.predict(img_array)
    class_index = np.argmax(predictions[0])
    confidence = predictions[0][class_index]

    print("\n🔍 Prediction Result")
    print("-------------------------")
    print(f"Class: {labels[class_index]}")
    print(f"Confidence: {confidence:.2f}")

    return labels[class_index]

# RUN
predict_image("test_leaf.jpg")
