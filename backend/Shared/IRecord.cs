public interface IRecord
{
    int Id { get; set; }
}

public interface IPublishableRecord : IRecord
{
    string Estado { get; set; }
}
