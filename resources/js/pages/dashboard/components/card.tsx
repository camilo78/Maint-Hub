import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function StatCard({
    description,
    cardTitle,
    badge,
    badgeIcon,
    footerIconTitle,
    footerIcon,
    footerDescription,
}: {
    description: string;
    cardTitle: string | number;
    badge: string;
    badgeIcon: React.ReactNode;
    footerIconTitle: string;
    footerIcon: React.ReactNode;
    footerDescription: string;
}) {
    return (
        <Card className="absolute inset-0 flex flex-col justify-between overflow-hidden">
            <CardHeader className="pb-0 pt-0 pr-4">
                <CardDescription className="truncate pr-16">{description}</CardDescription>
                <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl truncate flex-1 min-w-0">
                        {cardTitle}
                    </CardTitle>
                    <Badge variant="outline" className="flex gap-1 rounded-lg text-xs whitespace-nowrap">
                        {badgeIcon}
                        {badge}
                    </Badge>
                </div>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1 px-4 pb-0 pt-0 -mt-6 text-sm">
                <div className="flex items-center gap-2 font-medium w-full min-w-0">
                    <span className="truncate">{footerIconTitle}</span>
                    {footerIcon}
                </div>
                <div className="text-muted-foreground truncate w-full">{footerDescription}</div>
            </CardFooter>
        </Card>
    );
}