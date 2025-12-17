import "./loading.css";

export default function PageLoader() {
  return (
    <div className="page-loader">
      <div className="spinner" />
      <span>Yükleniyor...</span>
    </div>
  );
}
