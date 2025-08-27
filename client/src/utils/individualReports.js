import * as XLSX from 'xlsx';
import { format, parseISO } from 'date-fns';

/**
 * Generate individual agent report
 * @param {Object} week - Week data object
 * @param {Object} agent - Agent data object
 */
export const generateAgentReport = (week, agent) => {
    try {
        const wb = XLSX.utils.book_new();

        // Calculate total P/L for agent's downline players
        const totalDownlinePL = agent.totalDownlinePL ||
            (agent.downlinePlayers ? agent.downlinePlayers.reduce((sum, player) => sum + (player.pl || 0), 0) : 0);

        // Agent Summary Sheet
        const agentSummary = [
            ['AGENT RAKEBACK REPORT'],
            [''],
            ['Agent Information'],
            ['Agent Name', agent.username],
            ['Super Agent', agent.superAgent !== '-' ? agent.superAgent : 'Direct'],
            ['Report Period', `${format(parseISO(week.startDate), 'MMM d, yyyy')} - ${format(parseISO(week.endDate), 'MMM d, yyyy')}`],
            ['Generated On', format(new Date(), 'MMM d, yyyy, h:mm a')],
            [''],
            ['RAKEBACK CALCULATION BREAKDOWN'],
            ['Base Percentage', `${agent.percentage}%`],
            ['Total Downline Rake', `$${agent.totalDownlineRake.toFixed(2)}`],
            ['Total Downline P/L', `$${totalDownlinePL.toFixed(2)}`],
            ['Base Rakeback Calculation', `$${agent.totalDownlineRake.toFixed(2)} × ${agent.percentage}% = $${(agent.totalDownlineRake * (agent.percentage / 100)).toFixed(2)}`],
            [''],
        ];

        let currentRakeback = agent.totalDownlineRake * (agent.percentage / 100);

        // Add tax/rebate calculation if applicable
        if (agent.taxRebate) {
            const taxRebateAmount = -0.1 * (totalDownlinePL + agent.totalDownlineRake);
            const isRebate = taxRebateAmount > 0;

            agentSummary.push(['TAX/REBATE ADJUSTMENT']);
            agentSummary.push(['Tax/Rebate Applied', 'Yes']);
            agentSummary.push(['Formula', '10% of (Rake + P/L)']);
            agentSummary.push(['Calculation', `10% × ($${agent.totalDownlineRake.toFixed(2)} + $${totalDownlinePL.toFixed(2)}) = 10% × $${(agent.totalDownlineRake + totalDownlinePL).toFixed(2)}`]);
            agentSummary.push(['Tax/Rebate Amount', `$${Math.abs(taxRebateAmount).toFixed(2)} ${isRebate ? '(Rebate - Added)' : '(Tax - Deducted)'}`]);
            agentSummary.push(['After Tax/Rebate', `$${currentRakeback.toFixed(2)} ${isRebate ? '+' : '-'} $${Math.abs(taxRebateAmount).toFixed(2)} = $${(currentRakeback + taxRebateAmount).toFixed(2)}`]);
            currentRakeback = currentRakeback + taxRebateAmount;
            agentSummary.push(['']);
        }

        // Add routing calculation if applicable
        if (agent.routing && agent.routing.length > 0) {
            agentSummary.push(['ROUTING ADDITIONS']);
            agentSummary.push(['Routing Type', 'Receives percentage of other entities\' rake']);
            agentSummary.push(['']);

            let totalRoutingReceived = agent.routingRakeback || 0;

            agent.routing.forEach((route, index) => {
                // Calculate target entity's total rake from saved week data
                let targetRake = 0;
                let targetDescription = '';

                if (route.type === 'player') {
                    // Look in the complete extracted data first, fall back to player results
                    const targetPlayer = week.data.extractedData?.find(p =>
                        p.nickname.toLowerCase() === route.username.toLowerCase()
                    ) || week.data.playerResults?.find(p =>
                        p.username.toLowerCase() === route.username.toLowerCase()
                    );
                    targetRake = targetPlayer?.rake || 0;
                    targetDescription = `${route.username} (Player)`;
                } else if (route.type === 'agent') {
                    // For agents, calculate total downline rake from extracted data
                    targetRake = week.data.extractedData
                        ?.filter(player => player.agent && player.agent.toLowerCase() === route.username.toLowerCase())
                        .reduce((sum, player) => sum + player.rake, 0) || 0;

                    // If not found in extracted data, check agent results
                    if (targetRake === 0) {
                        const targetAgent = week.data.agentResults?.find(a =>
                            a.username.toLowerCase() === route.username.toLowerCase()
                        );
                        targetRake = targetAgent?.totalDownlineRake || 0;
                    }
                    targetDescription = `${route.username} (Agent)`;
                } else if (route.type === 'superAgent') {
                    // For super agents, calculate total downline rake from extracted data
                    targetRake = week.data.extractedData
                        ?.filter(player => player.superAgent && player.superAgent.toLowerCase() === route.username.toLowerCase())
                        .reduce((sum, player) => sum + player.rake, 0) || 0;

                    // If not found in extracted data, check super agent results
                    if (targetRake === 0) {
                        const targetSuperAgent = week.data.superAgentResults?.find(sa =>
                            sa.username.toLowerCase() === route.username.toLowerCase()
                        );
                        targetRake = targetSuperAgent?.totalDownlineRake || 0;
                    }
                    targetDescription = `${route.username} (Super Agent)`;
                }

                const routingAmount = (targetRake * route.percentage / 100);

                agentSummary.push([`Route ${index + 1}`, '']);
                agentSummary.push(['  From Entity', targetDescription]);
                agentSummary.push(['  Entity Total Rake', `$${targetRake.toFixed(2)}`]);
                agentSummary.push(['  Routing Percentage', `${route.percentage}%`]);
                agentSummary.push(['  Amount Received', `$${targetRake.toFixed(2)} × ${route.percentage}% = $${routingAmount.toFixed(2)}`]);
                agentSummary.push(['']);
            });

            agentSummary.push(['Total Routing Received', `$${totalRoutingReceived.toFixed(2)}`]);
            agentSummary.push(['Final Calculation', `$${currentRakeback.toFixed(2)} + $${totalRoutingReceived.toFixed(2)} = $${(currentRakeback + totalRoutingReceived).toFixed(2)}`]);
            currentRakeback = currentRakeback + totalRoutingReceived;
            agentSummary.push(['']);
        }

        agentSummary.push(['FINAL RAKEBACK AMOUNT', `$${agent.rakeback.toFixed(2)}`]);

        const summaryWS = XLSX.utils.aoa_to_sheet(agentSummary);
        summaryWS['!cols'] = [{ width: 30 }, { width: 40 }];
        XLSX.utils.book_append_sheet(wb, summaryWS, 'Agent Summary');

        // Downline Players Detail Sheet
        if (agent.downlinePlayers && agent.downlinePlayers.length > 0) {
            const playersData = [
                ['DOWNLINE PLAYERS BREAKDOWN'],
                [''],
                ['Player', 'Rake Amount ($)', 'P/L Amount ($)', 'Contribution (%)']
            ];

            agent.downlinePlayers.forEach(player => {
                playersData.push([
                    player.username,
                    parseFloat(player.rake.toFixed(2)),
                    parseFloat((player.pl || 0).toFixed(2)),
                    `${player.contribution}%`
                ]);
            });

            // Add totals
            playersData.push(['']);
            playersData.push([
                'TOTAL',
                parseFloat(agent.totalDownlineRake.toFixed(2)),
                parseFloat(totalDownlinePL.toFixed(2)),
                '100%'
            ]);

            const playersWS = XLSX.utils.aoa_to_sheet(playersData);
            playersWS['!cols'] = [{ width: 20 }, { width: 15 }, { width: 15 }, { width: 15 }];
            XLSX.utils.book_append_sheet(wb, playersWS, 'Downline Players');
        }

        // Generate filename
        const startDateStr = format(parseISO(week.startDate), 'yyyy-MM-dd');
        const endDateStr = format(parseISO(week.endDate), 'yyyy-MM-dd');
        const filename = `Agent_Report_${agent.username}_${startDateStr}_to_${endDateStr}.xlsx`;

        XLSX.writeFile(wb, filename);

    } catch (err) {
        console.error("Error generating agent report:", err);
        alert("There was a problem generating the agent report. Please try again.");
    }
};

/**
 * Generate individual super agent report
 * @param {Object} week - Week data object
 * @param {Object} superAgent - Super agent data object
 */
export const generateSuperAgentReport = (week, superAgent) => {
    try {
        const wb = XLSX.utils.book_new();

        // Calculate total P/L for super agent's downline players
        const totalDownlinePL = superAgent.totalDownlinePL ||
            (superAgent.downlinePlayers ? superAgent.downlinePlayers.reduce((sum, player) => sum + (player.pl || 0), 0) : 0);

        // Super Agent Summary Sheet
        const superAgentSummary = [
            ['SUPER AGENT RAKEBACK REPORT'],
            [''],
            ['Super Agent Information'],
            ['Super Agent Name', superAgent.username],
            ['Report Period', `${format(parseISO(week.startDate), 'MMM d, yyyy')} - ${format(parseISO(week.endDate), 'MMM d, yyyy')}`],
            ['Generated On', format(new Date(), 'MMM d, yyyy, h:mm a')],
            [''],
            ['RAKEBACK CALCULATION BREAKDOWN'],
            ['Base Percentage', `${superAgent.percentage}%`],
            ['Total Downline Rake', `$${superAgent.totalDownlineRake.toFixed(2)}`],
            ['Total Downline P/L', `$${totalDownlinePL.toFixed(2)}`],
            ['Base Rakeback Calculation', `$${superAgent.totalDownlineRake.toFixed(2)} × ${superAgent.percentage}% = $${(superAgent.totalDownlineRake * (superAgent.percentage / 100)).toFixed(2)}`],
            [''],
        ];

        let currentRakeback = superAgent.totalDownlineRake * (superAgent.percentage / 100);

        // Add tax/rebate calculation if applicable
        if (superAgent.taxRebate) {
            const taxRebateAmount = -0.1 * (totalDownlinePL + superAgent.totalDownlineRake);
            const isRebate = taxRebateAmount > 0;

            superAgentSummary.push(['TAX/REBATE ADJUSTMENT']);
            superAgentSummary.push(['Tax/Rebate Applied', 'Yes']);
            superAgentSummary.push(['Formula', '10% of (Rake + P/L)']);
            superAgentSummary.push(['Calculation', `10% × ($${superAgent.totalDownlineRake.toFixed(2)} + $${totalDownlinePL.toFixed(2)}) = 10% × $${(superAgent.totalDownlineRake + totalDownlinePL).toFixed(2)}`]);
            superAgentSummary.push(['Tax/Rebate Amount', `$${Math.abs(taxRebateAmount).toFixed(2)} ${isRebate ? '(Rebate - Added)' : '(Tax - Deducted)'}`]);
            superAgentSummary.push(['After Tax/Rebate', `$${currentRakeback.toFixed(2)} ${isRebate ? '+' : '-'} $${Math.abs(taxRebateAmount).toFixed(2)} = $${(currentRakeback + taxRebateAmount).toFixed(2)}`]);
            currentRakeback = currentRakeback + taxRebateAmount;
            superAgentSummary.push(['']);
        }

        // Add routing calculation if applicable
        if (superAgent.routing && superAgent.routing.length > 0) {
            superAgentSummary.push(['ROUTING ADDITIONS']);
            superAgentSummary.push(['Routing Type', 'Receives percentage of other entities\' rake']);
            superAgentSummary.push(['']);

            let totalRoutingReceived = superAgent.routingRakeback || 0;

            superAgent.routing.forEach((route, index) => {
                // Calculate target entity's total rake from saved week data
                let targetRake = 0;
                let targetDescription = '';

                if (route.type === 'player') {
                    // Look in the complete extracted data first, fall back to player results
                    const targetPlayer = week.data.extractedData?.find(p =>
                        p.nickname.toLowerCase() === route.username.toLowerCase()
                    ) || week.data.playerResults?.find(p =>
                        p.username.toLowerCase() === route.username.toLowerCase()
                    );
                    targetRake = targetPlayer?.rake || 0;
                    targetDescription = `${route.username} (Player)`;
                } else if (route.type === 'agent') {
                    // For agents, calculate total downline rake from extracted data
                    targetRake = week.data.extractedData
                        ?.filter(player => player.agent && player.agent.toLowerCase() === route.username.toLowerCase())
                        .reduce((sum, player) => sum + player.rake, 0) || 0;

                    // If not found in extracted data, check agent results
                    if (targetRake === 0) {
                        const targetAgent = week.data.agentResults?.find(a =>
                            a.username.toLowerCase() === route.username.toLowerCase()
                        );
                        targetRake = targetAgent?.totalDownlineRake || 0;
                    }
                    targetDescription = `${route.username} (Agent)`;
                } else if (route.type === 'superAgent') {
                    // For super agents, calculate total downline rake from extracted data
                    targetRake = week.data.extractedData
                        ?.filter(player => player.superAgent && player.superAgent.toLowerCase() === route.username.toLowerCase())
                        .reduce((sum, player) => sum + player.rake, 0) || 0;

                    // If not found in extracted data, check super agent results
                    if (targetRake === 0) {
                        const targetSuperAgent = week.data.superAgentResults?.find(sa =>
                            sa.username.toLowerCase() === route.username.toLowerCase()
                        );
                        targetRake = targetSuperAgent?.totalDownlineRake || 0;
                    }
                    targetDescription = `${route.username} (Super Agent)`;
                }

                const routingAmount = (targetRake * route.percentage / 100);

                superAgentSummary.push([`Route ${index + 1}`, '']);
                superAgentSummary.push(['  From Entity', targetDescription]);
                superAgentSummary.push(['  Entity Total Rake', `$${targetRake.toFixed(2)}`]);
                superAgentSummary.push(['  Routing Percentage', `${route.percentage}%`]);
                superAgentSummary.push(['  Amount Received', `$${targetRake.toFixed(2)} × ${route.percentage}% = $${routingAmount.toFixed(2)}`]);
                superAgentSummary.push(['']);
            });

            superAgentSummary.push(['Total Routing Received', `$${totalRoutingReceived.toFixed(2)}`]);
            superAgentSummary.push(['Final Calculation', `$${currentRakeback.toFixed(2)} + $${totalRoutingReceived.toFixed(2)} = $${(currentRakeback + totalRoutingReceived).toFixed(2)}`]);
            currentRakeback = currentRakeback + totalRoutingReceived;
            superAgentSummary.push(['']);
        }

        superAgentSummary.push(['FINAL RAKEBACK AMOUNT', `$${superAgent.rakeback.toFixed(2)}`]);
        superAgentSummary.push(['']);
        superAgentSummary.push(['DOWNLINE OVERVIEW']);
        superAgentSummary.push(['Total Agents Under Management', superAgent.agentsCount || 0]);
        superAgentSummary.push(['Total Players Under Management', superAgent.playersCount || 0]);

        const summaryWS = XLSX.utils.aoa_to_sheet(superAgentSummary);
        summaryWS['!cols'] = [{ width: 30 }, { width: 40 }];
        XLSX.utils.book_append_sheet(wb, summaryWS, 'Super Agent Summary');

        // Downline Agents Detail Sheet
        if (superAgent.downlineAgents && superAgent.downlineAgents.length > 0) {
            const agentsData = [
                ['DOWNLINE AGENTS BREAKDOWN'],
                [''],
                ['Agent', 'Rake Amount ($)', 'Contribution (%)']
            ];

            superAgent.downlineAgents.forEach(agent => {
                agentsData.push([
                    agent.username,
                    parseFloat(agent.rake.toFixed(2)),
                    `${agent.contribution}%`
                ]);
            });

            const agentsWS = XLSX.utils.aoa_to_sheet(agentsData);
            agentsWS['!cols'] = [{ width: 20 }, { width: 15 }, { width: 15 }];
            XLSX.utils.book_append_sheet(wb, agentsWS, 'Downline Agents');
        }

        // Downline Players Detail Sheet
        if (superAgent.downlinePlayers && superAgent.downlinePlayers.length > 0) {
            const playersData = [
                ['DOWNLINE PLAYERS BREAKDOWN'],
                [''],
                ['Player', 'Rake Amount ($)', 'P/L Amount ($)', 'Contribution (%)']
            ];

            superAgent.downlinePlayers.forEach(player => {
                playersData.push([
                    player.username,
                    parseFloat(player.rake.toFixed(2)),
                    parseFloat((player.pl || 0).toFixed(2)),
                    `${player.contribution}%`
                ]);
            });

            const playersWS = XLSX.utils.aoa_to_sheet(playersData);
            playersWS['!cols'] = [{ width: 20 }, { width: 15 }, { width: 15 }, { width: 15 }];
            XLSX.utils.book_append_sheet(wb, playersWS, 'Downline Players');
        }

        // Generate filename
        const startDateStr = format(parseISO(week.startDate), 'yyyy-MM-dd');
        const endDateStr = format(parseISO(week.endDate), 'yyyy-MM-dd');
        const filename = `SuperAgent_Report_${superAgent.username}_${startDateStr}_to_${endDateStr}.xlsx`;

        XLSX.writeFile(wb, filename);

    } catch (err) {
        console.error("Error generating super agent report:", err);
        alert("There was a problem generating the super agent report. Please try again.");
    }
};
