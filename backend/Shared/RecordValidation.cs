public static class RecordValidation
{
    public static Task<string?> Validate<T>(T input, BazarDb db, bool? hasProductImages = null)
        where T : class, IRecord => input switch
    {
        Categoria x => CategoryValidation.Validate(x, db),
        Producto x => ProductValidation.Validate(x, db, hasProductImages),
        Servicio x => ServiceValidation.Validate(x, db),
        Promocion x => PromotionValidation.Validate(x, db),
        SeccionContenido x => SectionValidation.Validate(x, db),
        GaleriaImagen x => GalleryValidation.Validate(x, db),
        _ => Task.FromResult<string?>("Tipo inválido.")};
}
