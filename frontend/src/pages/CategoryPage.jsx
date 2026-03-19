import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
export default function CategoryPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  useEffect(() => { navigate(`/products?category=${slug}`, { replace: true }); }, [slug]);
  return null;
}
