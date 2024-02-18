namespace SistemaVenta.AplicacionWeb.Models.ViewModels
{
    public class VMProducto
    {
        public int IdProducto { get; set; }
        public string? CodigoBarra { get; set; }
        public string? Marca { get; set; }
        public string? Descripcion { get; set; }
        public int? IdCategoria { get; set; }
        public string? NombreCategoria { get; set; }
        public int? IdColor { get; set; }
        public string? NombreColor { get; set; }
        public int? IdTalle { get; set; }
        public string? NombreTalle { get; set; }
        public int? Stock { get; set; }
        public string? UrlImagen { get; set; }
        public string? Precio { get; set; }
        public string? PrecioEfectivo { get; set; }
        public string? PrecioTarjeta { get; set; }
        public int? EsActivo { get; set; }
    }
}
