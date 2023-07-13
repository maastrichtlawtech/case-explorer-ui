export const getQueryBuilderSchema = () => {
  return {
    schema: {
      type: 'object',
      required: [
        // 'title',
        // 'year',
        // 'rechtsgebied',
        // 'adjustLayout',
      ],
      additionalProperties: false,
      properties: {
        DataSources: {
          type: 'array',
          title: 'Data sources',
          uniqueItems: true,
          items: {
            enum: [
              'RS',
              'ECHR',
              'Eurlex'
            ],
            enumNames: [
              'Rechtspraak',
              'European Court of Human Rights',
              'Eurlex'
            ],
            type: 'string'
          },
        },
        Eclis: {
          type: 'string',
          title: 'ECLIs'
        },
        Keywords: {
          type: 'string',
          title: 'Keywords'
        },
        Articles: {
          type: 'string',
          title: 'Articles'
        },
        DateStart:{
          title: "Date start",
          type: 'string',
          format: 'date'
        },
        DateEnd:{
          title: "Date end",
          type: 'string',
          format: 'date'
        },
        Instances: {
          type: 'array',
          title: 'Instances',
          uniqueItems: true,
          items: {
            enum: instancesList.subinstances,
            type: 'string'
          },
        },
        Domains: {
          type: 'array',
          title: 'Domains',
          uniqueItems: true,
          items: {
            enum: domainsList.subdomains,
            type: 'string'
          },
        },
        Doctypes: {
          type: 'array',
          title: 'Document types',
          uniqueItems: true,
          items: {
            enum: [
              '',
              'DEC',
              'OPI'
            ],
            enumNames: [
              '',
              'Decision',
              'Opinion'
            ],
            type: 'string'
          },
        },
        DegreesSources: {
          type: 'integer',
          title: 'Degrees Sources',
          minimum: 0,
          maximum: 2,
        },
        DegreesTargets: {
          type: 'integer',
          title: 'Degrees Targets',
          minimum: 0,
          maximum: 2,
        },
      },
    },
    uiSchema: {
      Domains: {
        'ui:enumDisabled': domainsList.domains
      },
      Instances: {
        'ui:enumDisabled': instancesList.instances
      },
      DataSources: {
        'ui:enumDisabled': [
          'ECHR',
          'Eurlex'
        ]
      }
    }
  }
}

const domainsList = {
  domains: [
    'Bestuursrecht and subdomains',
    'Civielrecht and subdomains',
    'Internationaal publiekrecht and subdomains', 
    'Strafrecht and subdomains',
    'Uncategorized domains'
  ],
  subdomains: [
    'Bestuursrecht and subdomains',
    'Bestuursrecht',
    'Ambtenarenrecht',
    'Belastingrecht',
    'Bestuursprocesrecht',
    'Bestuursstrafrecht',
    'Europees bestuursrecht',
    'Mededingingsrecht',
    'Omgevingsrecht',
    'Socialezekerheidsrecht',
    'Vreemdelingenrecht',
    'Onderwijs/Studiefinanciering',
    'Ruimtelijk Bestuursrecht/Milieurecht/Energierecht',
    'Civielrecht and subdomains',
    'Civiel recht',
    'Aanbestedingsrecht',
    'Arbeidsrecht',
    'Burgerlijk procesrecht',
    'Europees civiel recht',
    'Goederenrecht',
    'Insolventierecht',
    'Intellectueel-eigendomsrecht',
    'Internationaal privaatrecht',
    'Ondernemingsrecht',
    'Personen- en familierecht',
    'Verbintenissenrecht',
    'Bouwrecht',
    'Burgerlijk recht',
    'Gezondheidsrecht',
    'Huurrecht/Woonrecht',
    'Vervoer/Verkeersrecht',
    'Verzekeringsrecht',
    'Telecom/ICT/Mediarecht',
    'Internationaal publiekrecht and subdomains',
    'Internationaal publiekrecht',
    'Mensenrechten',
    'Volkenrecht',
    'Strafrecht and subdomains',
    'Strafrecht',
    'Europees strafrecht',
    'Internationaal strafrecht',
    'Materieel strafrecht',
    'Penitentiair strafrecht',
    'Strafprocesrecht',
    'Uncategorized domains',
    'Algemeen/Overig/Niet-gelabeld',
    'Bank- en effectenrecht',
    'Gemeenschapsrecht EU',
    'Buitenlands Recht/Religieus recht',
  ]
}

const instancesList = {
  instances: [
    'Gerechtshoven', 
    'Rechtbanken', 
    'Andere instanties binnen het Koninkrijk'
  ],
  subinstances: [
    'Hoge Raad',
    'Raad van State',
    'Centrale Raad van Beroep',
    'College van Beroep voor het bedrijfsleven',
    'Gerechtshoven',
    'Gerechtshof Amsterdam',
    'Gerechtshof Arnhem-Leeuwarden',
    'Gerechtshof \'s-Gravenhage',
    'Gerechtshof \'s-Hertogenbosch',
    'Rechtbanken',
    'Rechtbank Amsterdam',
    'Rechtbank \'s-Gravenhage',
    'Rechtbank Gelderland',
    'Rechtbank Limburg',
    'Rechtbank Midden-Nederland',
    'Rechtbank Noord-Holland',
    'Rechtbank Noord-Nederland',
    'Rechtbank Oost-Brabant',
    'Rechtbank Overijssel',
    'Rechtbank Rotterdam',
    'Rechtbank Zeeland-West-Brabant',
    'Andere instanties binnen het Koninkrijk',
    'Constitutioneel Hof Sint Maarten',
    'Gemeenschappelijk Hof van Justitie van Aruba, Curaçao, Sint Maarten en van Bonaire, Sint Eustatius en Saba',
    'Gerecht in Ambtenarenzaken van Aruba, Curaçao, Sint Maarten en van Bonaire, Sint Eustatius en Saba',
    'Gerecht in Eerste Aanleg van Aruba',
    'Gerecht in eerste aanleg van Bonaire, Sint Eustatius en Saba',
    'Gerecht in eerste aanleg van Curaçao',
    'Gerecht in eerste aanleg van Sint Maarten',
    'Raad van Beroep in Ambtenarenzaken van Aruba, Curaçao, Sint Maarten en van Bonaire, Sint Eustatius en Saba',
    'Raad van Beroep voor Belastingzaken van Aruba, Curaçao, Sint Maarten en van Bonaire, Sint Eustatius en Saba'
  ]
}

export const DEFAULT_FORM_DATA = {
  "DataSources": [
      "RS"
  ],
  "Instances": [
      "Hoge Raad",
      "Raad van State",
      "Centrale Raad van Beroep",
      "College van Beroep voor het bedrijfsleven",
      "Gerechtshof Amsterdam",
      "Gerechtshof Arnhem-Leeuwarden",
      "Gerechtshof 's-Gravenhage",
      "Gerechtshof 's-Hertogenbosch",
      "Rechtbank Amsterdam",
      "Rechtbank 's-Gravenhage",
      "Rechtbank Gelderland",
      "Rechtbank Limburg",
      "Rechtbank Midden-Nederland",
      "Rechtbank Noord-Holland",
      "Rechtbank Noord-Nederland",
      "Rechtbank Oost-Brabant",
      "Rechtbank Overijssel",
      "Rechtbank Rotterdam",
      "Rechtbank Zeeland-West-Brabant"
  ],
  "Domains": [],
  "Doctypes": [
      "DEC"
  ],
  "DateStart": "1900-01-01",
  "DateEnd": "2021-01-01",
  "DegreesSources": 0,
  "DegreesTargets": 1,
  "Keywords": "werkgever* + aansprake* + BW"
}
