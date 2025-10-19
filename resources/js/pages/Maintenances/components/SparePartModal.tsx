import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Package, Wrench, DollarSign, MapPin, Loader2, AlertCircle, CheckCircle2, Tag } from 'lucide-react';
import es from '@/lang/es';

interface SparePart {
    id?: number;
    name: string;
    sku: string;
    description?: string;
    brand?: string;
    part_number?: string;
    stock: number;
    minimum_stock: number;
    cost_price?: number;
    sale_price?: number;
    unit_measure: string;
    location?: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    sparePart?: SparePart;
    onSuccess: (sparePart: SparePart) => void;
}

export default function SparePartModal({ isOpen, onClose, sparePart, onSuccess }: Props) {
    const [data, setData] = useState({
        name: '',
        sku: '',
        description: '',
        brand: '',
        part_number: '',
        stock: '0',
        minimum_stock: '5',
        cost_price: '',
        sale_price: '',
        unit_measure: 'Unit',
        location: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (sparePart) {
            setData({
                name: sparePart.name || '',
                sku: sparePart.sku || '',
                description: sparePart.description || '',
                brand: sparePart.brand || '',
                part_number: sparePart.part_number || '',
                stock: sparePart.stock?.toString() || '0',
                minimum_stock: sparePart.minimum_stock?.toString() || '5',
                cost_price: sparePart.cost_price?.toString() || '',
                sale_price: sparePart.sale_price?.toString() || '',
                unit_measure: sparePart.unit_measure || 'Unit',
                location: sparePart.location || '',
            });
        } else {
            setData({
                name: '',
                sku: '',
                description: '',
                brand: '',
                part_number: '',
                stock: '0',
                minimum_stock: '5',
                cost_price: '',
                sale_price: '',
                unit_measure: 'Unit',
                location: '',
            });
        }
        setErrors({});
    }, [sparePart]);

    const generateSKU = (name: string, unitMeasure: string) => {
        if (!name || !unitMeasure) return '';
        
        const nameCode = name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
        const unitCode = unitMeasure.substring(0, 3).toUpperCase();
        const timestamp = Date.now().toString().slice(-4);
        
        return `${nameCode}-${unitCode}-${timestamp}`;
    };

    const updateData = (field: string, value: string) => {
        const newData = { ...data, [field]: value };

        // Auto-generate SKU only for new spare parts (not editing)
        if (!sparePart?.id && (field === 'name' || field === 'unit_measure')) {
            newData.sku = generateSKU(
                field === 'name' ? value : data.name,
                field === 'unit_measure' ? value : data.unit_measure
            );
        }

        setData(newData);
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleBlur = async () => {
        // Validar que tengamos los campos mínimos requeridos antes de guardar
        if (!data.name || !data.sku || !data.unit_measure) {
            return; // No guardar si faltan campos obligatorios
        }

        try {
            if (sparePart?.id) {
                // MODO EDICIÓN: Actualizar repuesto existente
                // Excluir SKU y name del envío porque son únicos y no se pueden modificar
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { sku, name, ...dataWithoutUniqueFields } = data;

                const submitData = {
                    ...dataWithoutUniqueFields,
                    stock: parseInt(data.stock) || 0,
                    minimum_stock: parseInt(data.minimum_stock) || 5,
                    cost_price: data.cost_price ? parseFloat(data.cost_price) : null,
                    sale_price: data.sale_price ? parseFloat(data.sale_price) : null,
                };

                const response = await window.axios.put(`/spare-parts/${sparePart.id}`, submitData);
                onSuccess(response.data.sparePart);
            } else {
                // MODO CREACIÓN: Crear nuevo repuesto automáticamente
                const submitData = {
                    ...data,
                    stock: parseInt(data.stock) || 0,
                    minimum_stock: parseInt(data.minimum_stock) || 5,
                    cost_price: data.cost_price ? parseFloat(data.cost_price) : null,
                    sale_price: data.sale_price ? parseFloat(data.sale_price) : null,
                };

                const response = await window.axios.post('/spare-parts', submitData);
                onSuccess(response.data.sparePart);
                handleClose();
            }
        } catch (error: any) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }
        }
    };

    const handleClose = () => {
        setData({
            name: '',
            sku: '',
            description: '',
            brand: '',
            part_number: '',
            stock: '0',
            minimum_stock: '5',
            cost_price: '',
            sale_price: '',
            unit_measure: 'Unit',
            location: '',
        });
        setErrors({});
        onClose();
    };

    const [loading, setLoading] = useState(false);

    const handleBlurWithLoading = async () => {
        setLoading(true);
        await handleBlur();
        setLoading(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <Package className="h-6 w-6 text-gray-600" />
                        <DialogTitle>
                            {sparePart?.id ? es['Edit Spare Part'] : es['New Spare Part']}
                        </DialogTitle>
                        {loading && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
                    </div>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Información básica */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Tag className="h-5 w-5 text-gray-600" />
                                <h3 className="text-sm font-semibold">Información Básica</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name" className="flex items-center gap-1">
                                        {es['Name']} <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => updateData('name', e.target.value)}
                                        disabled={!!sparePart?.id}
                                        className={sparePart?.id ? "bg-gray-50 text-gray-600" : ""}
                                        required
                                    />
                                    {sparePart?.id && (
                                        <div className="flex items-center gap-2 mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                                            <AlertCircle className="h-3 w-3 text-yellow-600 flex-shrink-0" />
                                            <p className="text-xs text-yellow-800">
                                                {es['No se puede modificar el nombre de repuestos existentes']}
                                            </p>
                                        </div>
                                    )}
                                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="sku" className="flex items-center gap-1">
                                        SKU <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="sku"
                                            value={data.sku}
                                            disabled
                                            className="bg-gray-50 text-gray-600"
                                            placeholder={sparePart?.id ? es['SKU existente'] : es['Se genera automáticamente']}
                                        />
                                        {data.sku && !sparePart?.id && (
                                            <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-600" />
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {sparePart?.id ? es['No se puede modificar el SKU de repuestos existentes'] : es['Se genera automáticamente basado en nombre y unidad']}
                                    </p>
                                    {errors.sku && <p className="text-red-500 text-sm mt-1">{errors.sku}</p>}
                                </div>
                            </div>

                            <div className="mt-4">
                                <Label htmlFor="description">{es['Description']}</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => updateData('description', e.target.value)}
                                    onBlur={handleBlurWithLoading}
                                    rows={3}
                                    className="resize-none"
                                />
                                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Detalles técnicos */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Wrench className="h-5 w-5 text-gray-600" />
                                <h3 className="text-sm font-semibold">Detalles Técnicos</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="brand">{es['Brand']}</Label>
                                    <Input
                                        id="brand"
                                        value={data.brand}
                                        onChange={(e) => updateData('brand', e.target.value)}
                                        onBlur={handleBlurWithLoading}
                                    />
                                    {errors.brand && <p className="text-red-500 text-sm mt-1">{errors.brand}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="part_number">{es['Part Number']}</Label>
                                    <Input
                                        id="part_number"
                                        value={data.part_number}
                                        onChange={(e) => updateData('part_number', e.target.value)}
                                        onBlur={handleBlurWithLoading}
                                    />
                                    {errors.part_number && <p className="text-red-500 text-sm mt-1">{errors.part_number}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Inventario */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Package className="h-5 w-5 text-gray-600" />
                                <h3 className="text-sm font-semibold">Inventario</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="stock" className="flex items-center gap-1">
                                        {es['Stock']} <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="stock"
                                        type="number"
                                        min="0"
                                        value={data.stock}
                                        onChange={(e) => updateData('stock', e.target.value)}
                                        onBlur={handleBlurWithLoading}
                                        required
                                    />
                                    {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="minimum_stock" className="flex items-center gap-1">
                                        {es['Minimum Stock']} <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="minimum_stock"
                                        type="number"
                                        min="0"
                                        value={data.minimum_stock}
                                        onChange={(e) => updateData('minimum_stock', e.target.value)}
                                        onBlur={handleBlurWithLoading}
                                        required
                                    />
                                    {errors.minimum_stock && <p className="text-red-500 text-sm mt-1">{errors.minimum_stock}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="unit_measure" className="flex items-center gap-1">
                                        {es['Unit Measure']} <span className="text-red-500">*</span>
                                    </Label>
                                    <Select value={data.unit_measure} onValueChange={async (value) => {
                                        updateData('unit_measure', value);
                                        if (sparePart?.id) {
                                            setLoading(true);
                                            await handleBlur();
                                            setLoading(false);
                                        }
                                    }}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Unit">{es['Unit']}</SelectItem>
                                            <SelectItem value="Piece">{es['Piece']}</SelectItem>
                                            <SelectItem value="Meter">{es['Meter']}</SelectItem>
                                            <SelectItem value="Kilogram">{es['Kilogram']}</SelectItem>
                                            <SelectItem value="Liter">{es['Liter']}</SelectItem>
                                            <SelectItem value="Box">{es['Box']}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.unit_measure && <p className="text-red-500 text-sm mt-1">{errors.unit_measure}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Precios */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 mb-4">
                                <DollarSign className="h-5 w-5 text-gray-600" />
                                <h3 className="text-sm font-semibold">Precios</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="cost_price">{es['Cost Price']}</Label>
                                    <Input
                                        id="cost_price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.cost_price}
                                        onChange={(e) => updateData('cost_price', e.target.value)}
                                        onBlur={handleBlurWithLoading}
                                    />
                                    {errors.cost_price && <p className="text-red-500 text-sm mt-1">{errors.cost_price}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="sale_price">{es['Sale Price']}</Label>
                                    <Input
                                        id="sale_price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.sale_price}
                                        onChange={(e) => updateData('sale_price', e.target.value)}
                                        onBlur={handleBlurWithLoading}
                                    />
                                    {errors.sale_price && <p className="text-red-500 text-sm mt-1">{errors.sale_price}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Ubicación */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 mb-4">
                                <MapPin className="h-5 w-5 text-gray-600" />
                                <h3 className="text-sm font-semibold">Ubicación</h3>
                            </div>

                            <div>
                                <Label htmlFor="location">{es['Location']}</Label>
                                <Input
                                    id="location"
                                    value={data.location}
                                    onChange={(e) => updateData('location', e.target.value)}
                                    onBlur={handleBlurWithLoading}
                                    placeholder={es['Storage location...']}
                                />
                                {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <DialogFooter className="mt-6">
                    <Button
                        type="button"
                        onClick={handleClose}
                        variant="outline"
                        className="w-full sm:w-auto"
                        disabled={loading}
                    >
                        {es['Close']}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}