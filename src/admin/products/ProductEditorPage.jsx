import { useEffect, useMemo, useState } from "react";
import { ImagePlus, Plus, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import AdminShell from "../components/AdminShell";
import { getAssetUrl, request } from "../../services/apiClient";

const createEmptyVariant = () => ({
  size: "",
  color: "",
  stock: "0",
});

const initialFormState = {
  name: "",
  brand: "",
  category: "men",
  type: "",
  description: "",
  price: "",
  originalPrice: "",
  discount: "",
  isFeatured: false,
  isNewArrival: false,
  variants: [createEmptyVariant()],
};

export default function ProductEditorPage({ mode = "create" }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = mode === "edit";

  const [form, setForm] = useState(initialFormState);
  const [existingImages, setExistingImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEditMode || !id) {
      return undefined;
    }

    let active = true;

    const loadProduct = async () => {
      try {
        setLoading(true);
        const product = await request(`/products/${id}`);

        if (!active) {
          return;
        }

        setForm({
          name: product.name || "",
          brand: product.brand || "",
          category: product.category || "men",
          type: product.type || "",
          description: product.description || "",
          price: product.price ?? "",
          originalPrice: product.originalPrice ?? "",
          discount: product.discount ?? "",
          isFeatured: Boolean(product.isFeatured),
          isNewArrival: Boolean(product.isNewArrival),
          variants: Array.isArray(product.variants) && product.variants.length
            ? product.variants.map((variant) => ({
                size: variant.size || "",
                color: variant.color || "",
                stock: String(variant.stock ?? 0),
              }))
            : [createEmptyVariant()],
        });
        setExistingImages(Array.isArray(product.images) ? product.images : []);
      } catch (error) {
        toast.error(error.message || "Failed to load product");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      active = false;
    };
  }, [id, isEditMode]);

  const previewUrls = useMemo(
    () => selectedFiles.map((file) => URL.createObjectURL(file)),
    [selectedFiles]
  );

  useEffect(
    () => () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    },
    [previewUrls]
  );

  const totalVariantStock = useMemo(
    () =>
      form.variants.reduce((total, variant) => total + (Number(variant.stock) || 0), 0),
    [form.variants]
  );

  const setField = (field, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const setVariantField = (index, field, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      variants: currentForm.variants.map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, [field]: value } : variant
      ),
    }));
  };

  const addVariant = () => {
    setForm((currentForm) => ({
      ...currentForm,
      variants: [...currentForm.variants, createEmptyVariant()],
    }));
  };

  const removeVariant = (index) => {
    setForm((currentForm) => ({
      ...currentForm,
      variants:
        currentForm.variants.length === 1
          ? currentForm.variants
          : currentForm.variants.filter((_, variantIndex) => variantIndex !== index),
    }));
  };

  const handleFileChange = (event) => {
    setSelectedFiles(Array.from(event.target.files || []));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const normalizedVariants = form.variants.map((variant) => ({
      size: variant.size.trim(),
      color: variant.color.trim(),
      stock: Number(variant.stock),
    }));

    if (!form.name.trim() || !form.price) {
      toast.error("Product name and selling price are required");
      return;
    }

    if (
      normalizedVariants.some(
        (variant) =>
          !variant.size ||
          !variant.color ||
          !Number.isInteger(variant.stock) ||
          variant.stock < 0
      )
    ) {
      toast.error("Each variant needs a size, color, and valid stock number");
      return;
    }

    if (!selectedFiles.length && !existingImages.length) {
      toast.error("Add at least one product image");
      return;
    }

    const formData = new FormData();
    formData.append("name", form.name.trim());
    formData.append("brand", form.brand.trim());
    formData.append("category", form.category.trim());
    formData.append("type", form.type.trim());
    formData.append("description", form.description.trim());
    formData.append("price", String(form.price).trim());

    if (String(form.originalPrice).trim()) {
      formData.append("originalPrice", String(form.originalPrice).trim());
    }

    if (String(form.discount).trim()) {
      formData.append("discount", String(form.discount).trim());
    }

    formData.append("isFeatured", String(form.isFeatured));
    formData.append("isNewArrival", String(form.isNewArrival));
    formData.append("variants", JSON.stringify(normalizedVariants));

    selectedFiles.forEach((file) => {
      formData.append("images", file);
    });

    try {
      setSaving(true);

      await request(
        isEditMode ? `/products/${id}` : "/products",
        isEditMode ? "PUT" : "POST",
        formData
      );

      toast.success(isEditMode ? "Product updated" : "Product created");
      navigate("/admin/products", { replace: true });
    } catch (error) {
      toast.error(error.message || "Unable to save product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell
      title={isEditMode ? "Refine product" : "Launch product"}
      description="Use consistent pricing, clean imagery, and complete variant coverage before publishing inventory."
      actions={
        <Link to="/admin/products" className="admin-secondary-action">
          Back to catalog
        </Link>
      }
    >
      {loading ? (
        <section className="admin-section-card admin-loading-state">
          <div className="admin-loader" />
          <p>Loading product editor...</p>
        </section>
      ) : (
        <form className="admin-editor-layout" onSubmit={handleSubmit}>
          <section className="admin-section-card admin-editor-form">
            <div className="admin-form-grid">
              <label className="admin-field">
                <span>Product name</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => setField("name", event.target.value)}
                  placeholder="Cove Runner"
                />
              </label>

              <label className="admin-field">
                <span>Brand</span>
                <input
                  type="text"
                  value={form.brand}
                  onChange={(event) => setField("brand", event.target.value)}
                  placeholder="Sole Society"
                />
              </label>

              <label className="admin-field">
                <span>Category</span>
                <select
                  value={form.category}
                  onChange={(event) => setField("category", event.target.value)}
                >
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                  <option value="unisex">Unisex</option>
                </select>
              </label>

              <label className="admin-field">
                <span>Type</span>
                <input
                  type="text"
                  value={form.type}
                  onChange={(event) => setField("type", event.target.value)}
                  placeholder="Sneaker, loafer, runner..."
                />
              </label>

              <label className="admin-field">
                <span>Selling price</span>
                <input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(event) => setField("price", event.target.value)}
                  placeholder="4999"
                />
              </label>

              <label className="admin-field">
                <span>Original price</span>
                <input
                  type="number"
                  min="0"
                  value={form.originalPrice}
                  onChange={(event) => setField("originalPrice", event.target.value)}
                  placeholder="5999"
                />
              </label>

              <label className="admin-field">
                <span>Discount (%)</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.discount}
                  onChange={(event) => setField("discount", event.target.value)}
                  placeholder="15"
                />
              </label>
            </div>

            <label className="admin-field">
              <span>Description</span>
              <textarea
                rows="5"
                value={form.description}
                onChange={(event) => setField("description", event.target.value)}
                placeholder="Describe fit, finish, material, and styling notes."
              />
            </label>

            <div className="admin-toggle-grid">
              <label className="admin-toggle">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(event) => setField("isFeatured", event.target.checked)}
                />
                <span>Feature on storefront</span>
              </label>

              <label className="admin-toggle">
                <input
                  type="checkbox"
                  checked={form.isNewArrival}
                  onChange={(event) => setField("isNewArrival", event.target.checked)}
                />
                <span>Mark as new arrival</span>
              </label>
            </div>

            <div className="admin-section-head">
              <div>
                <p className="admin-section-kicker">Variants</p>
                <h2>Size and color coverage</h2>
              </div>
              <button type="button" className="admin-secondary-action" onClick={addVariant}>
                <Plus size={16} />
                <span>Add variant</span>
              </button>
            </div>

            <div className="admin-variant-list">
              {form.variants.map((variant, index) => (
                <div key={`${variant.size}-${variant.color}-${index}`} className="admin-variant-row">
                  <input
                    type="text"
                    value={variant.size}
                    onChange={(event) => setVariantField(index, "size", event.target.value)}
                    placeholder="Size"
                  />
                  <input
                    type="text"
                    value={variant.color}
                    onChange={(event) => setVariantField(index, "color", event.target.value)}
                    placeholder="Color"
                  />
                  <input
                    type="number"
                    min="0"
                    value={variant.stock}
                    onChange={(event) => setVariantField(index, "stock", event.target.value)}
                    placeholder="Stock"
                  />
                  <button
                    type="button"
                    className="admin-icon-button"
                    onClick={() => removeVariant(index)}
                    disabled={form.variants.length === 1}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <label className="admin-upload-zone">
              <input type="file" multiple accept="image/*" onChange={handleFileChange} />
              <ImagePlus size={18} />
              <div>
                <strong>{selectedFiles.length ? `${selectedFiles.length} new image(s) selected` : "Upload product imagery"}</strong>
                <p>PNG or JPG, up to 5 images per product.</p>
              </div>
            </label>

            <div className="admin-image-grid">
              {selectedFiles.length
                ? previewUrls.map((url) => (
                    <img key={url} src={url} alt="Selected preview" className="admin-image-preview" />
                  ))
                : existingImages.map((image) => (
                    <img
                      key={image}
                      src={getAssetUrl(image)}
                      alt="Current product"
                      className="admin-image-preview"
                    />
                  ))}
            </div>

            <div className="admin-form-actions">
              <Link to="/admin/products" className="admin-secondary-action">
                Cancel
              </Link>
              <button type="submit" className="admin-primary-action" disabled={saving}>
                {saving ? "Saving..." : isEditMode ? "Save changes" : "Create product"}
              </button>
            </div>
          </section>

          <aside className="admin-section-card admin-editor-summary">
            <p className="admin-section-kicker">Quality check</p>
            <h2>Publishing snapshot</h2>

            <div className="admin-summary-stack">
              <div>
                <span>Variants</span>
                <strong>{form.variants.length}</strong>
              </div>
              <div>
                <span>Total stock</span>
                <strong>{totalVariantStock}</strong>
              </div>
              <div>
                <span>Images</span>
                <strong>{selectedFiles.length || existingImages.length}</strong>
              </div>
            </div>

            <p className="admin-empty-copy">
              Use this page as the final merchandising checkpoint before your product goes live.
            </p>
          </aside>
        </form>
      )}
    </AdminShell>
  );
}
