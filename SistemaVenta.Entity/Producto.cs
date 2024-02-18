using System;
using System.Collections.Generic;

namespace SistemaVenta.Entity
{
    public partial class Producto
    {
        public int IdProducto { get; set; }
        public string? CodigoBarra { get; set; }
        public string? Marca { get; set; }
        public string? Descripcion { get; set; }
        public int? IdCategoria { get; set; }
        public int? IdColor { get; set; }
        public int? IdTalle { get; set; }
        public int? Stock { get; set; }
        public string? UrlImagen { get; set; }
        public string? NombreImagen { get; set; }
        public decimal? Precio { get; set; }
        public decimal? PrecioEfectivo { get; set; }
        public decimal? PrecioTarjeta { get; set; }
        public bool? EsActivo { get; set; }
        public DateTime? FechaRegistro { get; set; }

        public virtual Categoria? IdCategoriaNavigation { get; set; }
        public virtual Color? IdColorNavigation { get; set; }
        public virtual Talle? IdTalleNavigation { get; set; }
    }
}
