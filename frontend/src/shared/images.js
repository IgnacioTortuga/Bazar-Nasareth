const imageUrl = (id) => (id ? `/api/imagenes/${id}/archivo` : null);
export { imageUrl };
