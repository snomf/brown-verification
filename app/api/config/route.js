import { NextResponse } from 'next/server';
import { getServerConfig } from '@/lib/config';

export async function GET() {
    try {
        const config = await getServerConfig();
        
        // Generate a friendly role mapping for the UI
        const roleMap = {};
        if (config.roles.ACCEPTED) roleMap[config.roles.ACCEPTED] = 'Accepted';
        if (config.roles.CERTIFIED) roleMap[config.roles.CERTIFIED] = 'Certified';
        if (config.roles.ALUMNI) roleMap[config.roles.ALUMNI] = 'Alumni';
        if (config.roles.STUDENT) roleMap[config.roles.STUDENT] = 'Student';
        
        // Dynamic class years
        ['2026', '2027', '2028', '2029', '2030'].forEach(year => {
            if (config.roles[year]) {
                roleMap[config.roles[year]] = year;
            }
        });

        // Only return non-sensitive info
        return NextResponse.json({
            allowedEmailDomains: config.allowedEmailDomains,
            botStatusText: config.botStatusText,
            botStatusPresence: config.botStatusPresence,
            roleMap: roleMap
        });
    } catch (error) {
        console.error('[Config API] Error:', error);
        return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
    }
}
