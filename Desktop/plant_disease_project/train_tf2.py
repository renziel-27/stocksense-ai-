import tensorflow as tf
import json
import os

DATASET_DIR = "./PlantDoc-Dataset/train"
IMG_SIZE = 224
BATCH_SIZE = 16
EPOCHS = 10

# Load PlantDoc dataset
train_ds = tf.keras.preprocessing.image_dataset_from_directory(
    DATASET_DIR,
    image_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    label_mode='categorical'
)

# Save class names for prediction
class_names = train_ds.class_names
with open("labels.json", "w") as f:
    json.dump({i: name for i, name in enumerate(class_names)}, f, indent=4)

print("Detected Classes:")
print(class_names)

# Load pretrained MobileNetV2
base = tf.keras.applications.MobileNetV2(
    input_shape=(IMG_SIZE, IMG_SIZE, 3),
    include_top=False,
    weights='imagenet'
)
base.trainable = False  # Freeze base layers

# Build classifier
model = tf.keras.Sequential([
    base,
    tf.keras.layers.GlobalAveragePooling2D(),
    tf.keras.layers.Dense(len(class_names), activation='softmax')
])

# Compile model
model.compile(
    optimizer="adam",
    loss="categorical_crossentropy",
    metrics=["accuracy"]
)

# Train model
history = model.fit(train_ds, epochs=EPOCHS)

# Save trained model
model.save("plantdoc_model_tf2_m2.h5")
print("Model saved as plantdoc_model_tf2_m2.h5")




