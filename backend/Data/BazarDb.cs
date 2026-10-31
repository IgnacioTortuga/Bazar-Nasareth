using Microsoft.EntityFrameworkCore;

public class BazarDb(DbContextOptions<BazarDb> options) : DbContext(options)
{
    public DbSet<Categoria> Categorias => Set<Categoria>();
    public DbSet<Producto> Productos => Set<Producto>();
    public DbSet<ProductoImagen> ProductoImagenes => Set<ProductoImagen>();
    public DbSet<Servicio> Servicios => Set<Servicio>();
    public DbSet<Promocion> Promociones => Set<Promocion>();
    public DbSet<PromocionProducto> PromocionProductos => Set<PromocionProducto>();
    public DbSet<PromocionServicio> PromocionServicios => Set<PromocionServicio>();
    public DbSet<Editor> Editores => Set<Editor>();
    public DbSet<Imagen> Imagenes => Set<Imagen>();
    public DbSet<SeccionContenido> Secciones => Set<SeccionContenido>();
    public DbSet<GaleriaImagen> Galeria => Set<GaleriaImagen>();
    public DbSet<InformacionNegocio> Negocio => Set<InformacionNegocio>();
    public DbSet<ClicWhatsApp> ClicsWhatsApp => Set<ClicWhatsApp>();
    public DbSet<ClicWhatsAppGaleria> ClicsWhatsAppGaleria => Set<ClicWhatsAppGaleria>();

    protected override void OnModelCreating(ModelBuilder m)
    {
        m.Entity<ClicWhatsApp>().ToTable("ClicWhatsApp").HasKey(x => new { x.ProductoId, x.Dia, x.Origen });
        m.Entity<ClicWhatsApp>().HasOne<Producto>().WithMany().HasForeignKey(x => x.ProductoId).OnDelete(DeleteBehavior.Restrict);
        m.Entity<ClicWhatsAppGaleria>().ToTable("ClicWhatsAppGaleria").HasKey(x => new { x.GaleriaImagenId, x.Dia });
        m.Entity<ClicWhatsAppGaleria>().HasOne<GaleriaImagen>().WithMany().HasForeignKey(x => x.GaleriaImagenId).OnDelete(DeleteBehavior.Restrict);
        m.Entity<Categoria>().ToTable("Categoria").HasIndex(x => x.Nombre).IsUnique();
        m.Entity<Producto>().ToTable("Producto", t => t.HasCheckConstraint("CK_Producto_Precio", "precio_informativo IS NULL OR (precio_informativo >= 0 AND moneda IS NOT NULL)"));
        m.Entity<Producto>().Property(x => x.PrecioInformativo).HasColumnName("precio_informativo").HasPrecision(12, 2);
        m.Entity<Producto>().Property(x => x.Moneda).HasColumnName("moneda");
        m.Entity<Producto>().HasOne(x => x.Categoria).WithMany().HasForeignKey(x => x.CategoriaId).OnDelete(DeleteBehavior.Restrict);
        m.Entity<ProductoImagen>().ToTable("ProductoImagen").HasKey(x => new { x.ProductoId, x.ImagenId });
        m.Entity<ProductoImagen>().HasIndex(x => new { x.ProductoId, x.Orden }).IsUnique();
        m.Entity<ProductoImagen>().HasOne(x => x.Producto).WithMany().HasForeignKey(x => x.ProductoId).OnDelete(DeleteBehavior.Cascade);
        m.Entity<ProductoImagen>().HasOne<Imagen>().WithMany().HasForeignKey(x => x.ImagenId).OnDelete(DeleteBehavior.Restrict);
        m.Entity<Servicio>().ToTable("Servicio", t => t.HasCheckConstraint("CK_Servicio_Precio", "precio_desde IS NULL OR (precio_desde >= 0 AND moneda IS NOT NULL)"));
        m.Entity<Servicio>().Property(x => x.PrecioDesde).HasColumnName("precio_desde").HasPrecision(12, 2);
        m.Entity<Servicio>().Property(x => x.Moneda).HasColumnName("moneda");
        m.Entity<Servicio>().HasOne<Imagen>().WithMany().HasForeignKey(x => x.ImagenId).OnDelete(DeleteBehavior.Restrict);
        m.Entity<Promocion>().ToTable("Promocion", t => t.HasCheckConstraint("CK_Promocion_Fechas", "[Inicio] IS NULL OR [Fin] IS NULL OR [Fin] > [Inicio]"));
        m.Entity<Promocion>().HasOne<Imagen>().WithMany().HasForeignKey(x => x.ImagenId).OnDelete(DeleteBehavior.Restrict);
        m.Entity<PromocionProducto>().ToTable("PromocionProducto").HasKey(x => new { x.PromocionId, x.ProductoId });
        m.Entity<PromocionProducto>().HasOne<Promocion>().WithMany().HasForeignKey(x => x.PromocionId).OnDelete(DeleteBehavior.Cascade);
        m.Entity<PromocionProducto>().HasOne<Producto>().WithMany().HasForeignKey(x => x.ProductoId).OnDelete(DeleteBehavior.Restrict);
        m.Entity<PromocionServicio>().ToTable("PromocionServicio").HasKey(x => new { x.PromocionId, x.ServicioId });
        m.Entity<PromocionServicio>().HasOne<Promocion>().WithMany().HasForeignKey(x => x.PromocionId).OnDelete(DeleteBehavior.Cascade);
        m.Entity<PromocionServicio>().HasOne<Servicio>().WithMany().HasForeignKey(x => x.ServicioId).OnDelete(DeleteBehavior.Restrict);
        m.Entity<Editor>().ToTable("Editor").HasIndex(x => x.Email).IsUnique();
        m.Entity<Imagen>().ToTable("Imagen");
        m.Entity<SeccionContenido>().ToTable("SeccionContenido").HasIndex(x => x.Clave).IsUnique();
        m.Entity<SeccionContenido>().HasOne<Imagen>().WithMany().HasForeignKey(x => x.ImagenId).OnDelete(DeleteBehavior.Restrict);
        m.Entity<GaleriaImagen>().ToTable("GaleriaImagen").HasIndex(x => x.Orden).IsUnique();
        m.Entity<GaleriaImagen>().HasOne<Imagen>().WithMany().HasForeignKey(x => x.ImagenId).OnDelete(DeleteBehavior.Restrict);
        m.Entity<InformacionNegocio>().ToTable("InformacionNegocio", t => t.HasCheckConstraint("CK_InformacionNegocio_Sede", "[Id] = 1"));
        m.Entity<InformacionNegocio>().Property(x => x.Id).ValueGeneratedNever();
    }
}
