import os
import pickle
import faiss
import numpy as np
from rank_bm25 import BM25Okapi
from sentence_transformers import SentenceTransformer
from llama_parse import LlamaParse

# Initialize Embedder
embedder = SentenceTransformer('all-MiniLM-L6-v2')

def sliding_window_chunking(text, chunk_size=200, overlap=40):
    words = text.split()
    chunks = []
    if not words:
        return chunks
    i = 0
    while i < len(words):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)
        if i + chunk_size >= len(words):
            break
        i += chunk_size - overlap
    return chunks

def build_hybrid_index(pdf_paths, output_dir="student_data"):
    # Parse PDFs
    parser = LlamaParse(result_type="markdown")  # Requires LLAMA_CLOUD_API_KEY in env
    
    all_chunks = []
    
    for path in pdf_paths:
        documents = parser.load_data(path)
        for doc in documents:
            text = doc.text
            
            # THE FIX: Slice off everything before the actual academic content starts
            start_index = text.find("Module-1")
            if start_index == -1:
                start_index = text.find("Module 1")
            if start_index == -1:
                start_index = text.find("MODULE 1")
                
            if start_index != -1:
                text = text[start_index:]
                
            chunks = sliding_window_chunking(text)
            all_chunks.extend(chunks)
            
    if not all_chunks:
        print("No content extracted.")
        return
    # FAISS HNSW Index
    embeddings = embedder.encode(all_chunks, convert_to_numpy=True)
    d = embeddings.shape[1]
    # M=32 is a typical parameter for HNSW graph structure
    index = faiss.IndexHNSWFlat(d, 32)
    faiss.normalize_L2(embeddings)
    index.add(embeddings)
    
    # BM25 Index
    tokenized_chunks = [chunk.lower().split() for chunk in all_chunks]
    bm25 = BM25Okapi(tokenized_chunks)
    
    # Storage
    os.makedirs(output_dir, exist_ok=True)
    
    faiss.write_index(index, os.path.join(output_dir, "faiss_index.bin"))
    
    with open(os.path.join(output_dir, "bm25_index.pkl"), "wb") as f:
        pickle.dump(bm25, f)
        
    with open(os.path.join(output_dir, "chunks.pkl"), "wb") as f:
        pickle.dump(all_chunks, f)
        
    print(f"Hybrid index built successfully and saved to {output_dir}")
