export type CyclePredictionSource = {
    citation: string;
    url?: string;
};

export const CYCLE_PREDICTION_SOURCES: CyclePredictionSource[] = [
    {
        citation:
            'Symul L, Wac K, Hillard P, et al. Assessment of menstrual health status and evolution through mobile apps for fertility awareness. npj Digit. Med. 2, 64 (2019).',
        url: 'https://doi.org/10.1038/s41746-019-0139-4',
    },
    {
        citation:
            'Bull JR, Rowland SP, Scherwitzl EB, et al. Real-world menstrual cycle characteristics of more than 600,000 menstrual cycles. npj Digit. Med. 2, 83 (2019).',
        url: 'https://doi.org/10.1038/s41746-019-0152-7',
    },
    {
        citation:
            'Faust L, Bradley D, Landau E, Noddin K, Farland LV, Baron A, Wolfberg A. Findings from a mobile application-based cohort are consistent with established knowledge of the menstrual cycle, fertile window, and conception. Fertil Steril. 2019 Sep;112(3):450-457.e3.',
        url: 'https://doi.org/10.1016/j.fertnstert.2019.05.008',
    },
];

export const CYCLE_PREDICTION_METHODOLOGY = {
    en: {
        title: 'How predictions are calculated',
        description:
            'Period and fertile window predictions are estimates based on your logged cycle history, using methods established in peer-reviewed research on real-world menstrual cycle data. The fertile window is approximated as the 5 days before and 1 day after the estimated ovulation date (typically ~14 days before the next period). These are educational estimates only and not a contraceptive method or medical diagnosis.',
        sourcesLabel: 'Sources',
        viewSourcesLabel: 'View sources',
        shortDisclaimer: 'Estimate, not medical advice.',
        disclaimerLabel:
            'Not medical advice. Consult a qualified healthcare provider for medical concerns or family planning decisions.',
    },
    sw: {
        title: 'Jinsi utabiri unavyokokotolewa',
        description:
            'Utabiri wa hedhi na siku za uzazi ni makadirio yanayotegemea historia ya mzunguko wako ulioandikishwa, ukitumia mbinu zilizothibitishwa katika tafiti za kisayansi za mizunguko ya hedhi. Siku za uzazi zinakadiriwa kuwa siku 5 kabla na siku 1 baada ya tarehe ya kukadiriwa ya ovulesheni (kwa kawaida ~siku 14 kabla ya hedhi inayofuata). Haya ni makadirio ya kielimu tu na siyo njia ya uzazi wa mpango wala uchunguzi wa kitabibu.',
        sourcesLabel: 'Marejeleo',
        viewSourcesLabel: 'Tazama marejeleo',
        shortDisclaimer: 'Makadirio, si ushauri wa kitabibu.',
        disclaimerLabel:
            'Si ushauri wa kitabibu. Tafadhali wasiliana na mtaalamu wa afya kwa masuala ya kiafya au maamuzi ya uzazi wa mpango.',
    },
} as const;
