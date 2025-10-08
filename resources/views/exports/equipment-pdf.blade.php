<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Inventario de Equipos</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .title { font-size: 18px; font-weight: bold; color: #333; margin-bottom: 10px; }
        .date { font-size: 12px; color: #666; }
        .client-info { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .client-name { font-size: 16px; font-weight: bold; color: #333; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 10px; }
        th { background-color: #f2f2f2; font-weight: bold; text-align: center; }
        .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">Inventario de Equipos</div>
        <div class="date">{{ $date }}</div>
    </div>

    <div class="client-info">
        <div class="client-name">Cliente: {{ $client->name }}</div>
    </div>

    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Etiqueta</th>
                <th>Descripción</th>
                <th>Categoría</th>
                <th>Estado</th>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Especificaciones</th>
            </tr>
        </thead>
        <tbody>
            @foreach($equipment as $index => $item)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ $item->asset_tag }}</td>
                <td>{{ $item->description }}</td>
                <td>{{ $item->category }}</td>
                <td>{{ ucwords(str_replace('_', ' ', $item->status)) }}</td>
                <td>{{ $item->brand }}</td>
                <td>{{ $item->model }}</td>
                <td>
                    @if($item->specifications)
                        @php
                            $specs = is_array($item->specifications) ? $item->specifications : json_decode($item->specifications, true);
                            $specText = [];
                            foreach ($specs as $key => $value) {
                                $specText[] = ucfirst(str_replace('_', ' ', $key)) . ': ' . $value;
                            }
                            echo implode(', ', $specText);
                        @endphp
                    @endif
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        Generado el {{ now()->format('d/m/Y H:i:s') }}
    </div>
</body>
</html>