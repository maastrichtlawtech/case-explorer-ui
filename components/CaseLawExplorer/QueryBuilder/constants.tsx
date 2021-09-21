import React from 'react'
import { Button, Slider, Typography } from '@material-ui/core'

const SliderUIField = ({ formData, schema, onChange, name }) => {
  return (
    <>
      <Typography id={`${schema.title}-continuous-slider`} gutterBottom>
        {schema.title ?? name}
      </Typography>
      <Slider
        value={formData ?? [schema.minimum, schema.maximum]}
        onChange={(e) => {
          onChange(e.target.value)
        }}
        valueLabelDisplay="auto"
        aria-labelledby={`${schema.title}-continuous-slider`}
        min={schema.minimum}
        max={schema.maximum}
      />
    </>
  )
}

export const getQueryBuilderSchema = () => {
  return {
    // children: <div></div>,
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
        Date: {
          type: 'array',
          title: 'Date',
          items: {
            type: 'number',
          },
          minimum: 1900,
          maximum: 2021,
        },
        Instances: {
          type: 'array',
          title: 'Instances',
          uniqueItems: true,
          items: {
            enum: instancesList.instances,
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
          minimum: 1,
          maximum: 5,
        },
        DegreesTargets: {
          type: 'integer',
          title: 'Degrees Targets',
          minimum: 1,
          maximum: 5,
        },
      },
    },
    uiSchema: {
      Date: {
        'ui:field': SliderUIField,
      },
      Domains: {
        'ui:enumDisabled': domainsList.domains
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
    'Hoge Raad', 
    'Raad van State', 
    'Centrale Raad van Beroep', 
    'College van Beroep voor het bedrijfsleven', 
    'Gerechtshoven', 
    'Rechtbanken', 
    'Andere instanties binnen het Koninkrijk'
  ]
}