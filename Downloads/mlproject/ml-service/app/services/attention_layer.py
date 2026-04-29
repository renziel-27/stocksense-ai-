import tensorflow as tf
from tensorflow.keras.layers import Layer
from tensorflow.keras import initializers, regularizers, constraints
from tensorflow.keras import backend as K

class AttentionLayer(Layer):
    """
    Custom Keras Attention Layer for LSTM Sequences.
    Calculates context vectors based on learned variable weights.
    """
    def __init__(self, units=64, **kwargs):
        self.units = units
        super(AttentionLayer, self).__init__(**kwargs)

    def build(self, input_shape):
        self.W = self.add_weight(shape=(input_shape[-1], self.units),
                                 initializer='glorot_uniform',
                                 trainable=True,
                                 name='attention_W')
        self.b = self.add_weight(shape=(self.units,),
                                 initializer='zeros',
                                 trainable=True,
                                 name='attention_b')
        self.u = self.add_weight(shape=(self.units, 1),
                                 initializer='glorot_uniform',
                                 trainable=True,
                                 name='attention_u')
        super(AttentionLayer, self).build(input_shape)

    def call(self, inputs):
        # inputs shape: (batch_size, time_steps, input_dim)
        score = tf.tanh(tf.tensordot(inputs, self.W, axes=1) + self.b)
        
        # Calculate attention weights
        attention_weights = tf.nn.softmax(tf.tensordot(score, self.u, axes=1), axis=1)
        
        # Calculate contexts
        context_vector = tf.reduce_sum(inputs * attention_weights, axis=1)
        
        return context_vector

    def compute_output_shape(self, input_shape):
        return (input_shape[0], input_shape[-1])

    def get_config(self):
        config = super(AttentionLayer, self).get_config()
        config.update({'units': self.units})
        return config
