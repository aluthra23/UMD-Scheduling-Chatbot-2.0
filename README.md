# UMD Scheduling Chatbot 2.0

## Overview

The UMD Scheduling Chatbot is an AI-powered assistant designed to help students at the University of Maryland find detailed information about courses and schedules. This project leverages Gemini for response generation and embeddings, and Qdrant Cloud for the vector database to provide accurate and timely responses to user queries about UMD classes. 
<!-- For a live demo, visit <a href="https://umd-chat-bot.streamlit.app/" target="_blank" rel="noopener noreferrer">UMD Chat Bot<a> -->

## Features

- **Course Recommendations**: Get recommendations for courses and instructors based on your preferences.
- **Dynamic Data Updates**: The vector store updates automatically with the latest scheduling information to ensure the chatbot provides accurate answers.
- **Efficient Information Retrieval**: Utilizes a vector store for fast and efficient similarity searches.

## Technologies Used

- **Python**: The core programming language used for developing the project.
- **Gemini**: Gemini is used for both response generation and embeddings in this project. Gemini powers the chatbot's natural language understanding and generation capabilities, processing user queries and generating contextually relevant responses. It also creates embeddings for course data that are used for similarity searches.
- **Qdrant Cloud**: Qdrant Cloud is used as the vector database to store and manage embeddings. It enables efficient similarity searches, ensuring the chatbot can quickly find relevant course information. The vector store is periodically updated with the latest course information, allowing the chatbot to perform fast and accurate searches.

## Embedding Architecture

The chatbot uses `sentence-transformers/all-MiniLM-L6-v2` for retrieval embeddings:

- The scraper generates normalized, 384-dimensional document vectors locally with FastEmbed.
- The browser generates normalized, 384-dimensional query vectors with Transformers.js.
- Qdrant compares those vectors using cosine similarity.
- Gemini is used only to generate an answer from the retrieved context.

The browser currently loads the FP32 version of MiniLM. Its initial model download is approximately 90 MB, but browsers should cache it for later visits.

### Possible Future Quantization

A quantized MiniLM model could reduce the initial download to roughly 20–30 MB and lower browser memory usage. The tradeoff is a small loss of numeric precision, which may slightly change semantic-search rankings for ambiguous natural-language queries.

Do not change only the browser to a quantized model. Document and query embeddings must use the same model artifact, precision, pooling method, normalization, and 384-dimensional output. When adopting quantization:

1. Configure both FastEmbed and Transformers.js to use the same quantized ONNX model.
2. Delete and recreate the Qdrant collection.
3. Re-embed and upload every document.
4. Test exact course-code and natural-language retrieval before deployment.

## Contributions

Contributions are welcome! Please fork the repository and submit a pull request with your changes. Ensure your code follows the project's coding standards and includes appropriate tests.

## License

This project is licensed under the [MIT License](LICENSE). See the LICENSE file for details.
