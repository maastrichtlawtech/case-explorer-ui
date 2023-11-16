# User Guide

## Case Law Explorer

The [Case Law Explorer software](https://dev.d11iy22xsphp3a.amplifyapp.com/) has been developed by the [Maastricht Law and Tech Lab](https://www.maastrichtuniversity.nl/about-um/faculties/law/research/law-and-tech-lab) and the [Brightlands Institute for Smart Society](https://www.biss-institute.com/). You will need to create an account in order to use the software (the SurfConext option currently only works for Maastricht University staff and students).

A handbook on legal network analysis is under development and will be released soon.

## Browser

The software is designed for Google Chrome, but also seems to function well in FireFox. Running the software in Safari is **_not_** recommended.

## Interface Overview

The interface offers a canvas in which the decisions (nodes) and citations (edges) are visualized. In addition, there are three panels:

- On the left: the search interface, filtering options, along with additional functionality that are described below. You can make the panel visible (and hide it) by clicking on the ![image](https://user-images.githubusercontent.com/31765316/162188974-7e453cc7-54c3-4e75-ac81-15f4807aa0b9.png) icon.
- On the right: a panel with information about the nodes, along with the network statistics. You can make the panel visible (and hide it) by clicking on the ![image](https://user-images.githubusercontent.com/31765316/162189371-ec5fe176-9a88-443b-9e94-ba02882466dc.png) icon.
- On the bottom: tools. You can make the panel visible (and hide it) by clicking on the ![image](https://user-images.githubusercontent.com/31765316/162189219-8a936d0a-5876-4d5c-b7a2-107db5c090e9.png) icon.

You can open or close the panels by clicking on the icons on the top left of the screen.

Moving left, right, up, and down on the canvas is possible by using the arrows on your keyboard or, when using a touchpad, by using two fingers.

Zoom out occurs when touching two fingers spread apart on the touchpad. Zoom in happens when bringing them together. When using a mouse, zooming in and out is possible by using the wheel in the middle of the mouse while keeping the CTRL button pressed.

## Creating a network

### Fetch Data

The data source currently includes Rechtspraak. In the near future, we hope to add case law of the European Convention/Court of Human Rights (ECHR) and of the Court of Justice of the European Union (CJEU, formerly ECJ).

You may search by means of ECLI(s), keywords, and/or Articles. Important: familiarize yourself with [this logic](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-simple-query-string-query.html). The use of operators has **_significant impact_** on the search results.

**_ECLI search._** Searching for an European Case Law Identifier (ECLI) entails that the references from/to the specified ECLI(s) will be searched - a so-called ‘ego-network’. When searching for citations in/to multiple ECLIs, separate them by a space. Example: ![image](https://user-images.githubusercontent.com/31765316/162190411-c7d95fe0-433b-4943-94ab-1f2a44e66255.png)

**_Keyword search._** A keyword search will return results from the full texts and the summaries (if available) (data fields: _full_text, summary, predecessor_successor_cases_). The quality of the results is heavily dependent on the smart use of [operators](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-simple-query-string-query.html).

**_Article search._** An article search looks for exact matches in the field legal*provisions. Articles must be searched in the following notation: "\_Burgerlijk Wetboek Boek 8, Artikel 931*" (quotation marks and word order matter, capitalization, punctuation and misspelling don't). When conducting an Article search, we advise you to find the notation in [this overview](https://docs.google.com/spreadsheets/d/1gX48CjTw5GXWmoDaMnY_oyU4xPMjZ2poQkHV1bH7tao/edit?usp=sharing).

(Advice: select the tab _wetten_unique_, search for the law of your interest (with Ctrl+F), and then construct the reference.
To search for a specific article, simply add “, Article” followed by the specific article number. For example, if you are interested in Article 162 of Book 6 of the Dutch Civil Code, you search for “Burgerlijk Wetboek”, which will point you to the reference “Burgerlijk Wetboek Boek X”. Because you are interested in Book 6, we replace the “X” with a “6”. Since we are interested in Article 162, the reference becomes “Burgerlijk Wetboek Boek 6, Artikel 162”.

Another example: if you want to search for cases that refer to Article 51 of the Dutch Criminal Code, you can search for “Strafrecht”, which will point you to “Wetboek van Strafrecht”. To construct the search term, you add the article: “Wetboek van Strafrecht, Artikel 51”.

Note that you can also search for specific references to articles under the articles*unique tab, but that this search can take a long time considering the many articles that need to be searched. It is therefore preferred that you use the \_wetten_unique* tab.)

**_Date (start / ned) / Instances / Domains._** You may filter the search based on the dates of the _decision_ (or opinion), _instances_, _domains_, and _document type_ (decision or Advocate-General Opinion).

Note: in Dutch case law, many decisions lack domain labels, meaning that decisions without these labels will not be included in the results when applying this filter (e.g. filtering for Domain=Verbintenissenrecht will not include some decisions that concern the domain ‘Verbintenissenrecht’ but are not labelled as such).

**_Degrees of Separation._** The software allows for adjusting the degrees of separation for the result nodes (i.e. the nodes that match the search). Sources are decisions that cite the result nodes. Targets are decisions that are cited in the result nodes.

Example: imagine that your search result returns one decision: C, and that A cites B, B cites C, C cites D, and D cites E. With

- Targets=1, the software will search for citations **_in_** C (i.e. from C to other decisions), and will therefore return that C cites D.
- Targets=2, the software will search for citations **_in_** C and for the citations in the cited decisions, and will therefore return that C cites D and that D cites E.
- Sources=1, the software will search for citations **_to_** C (i.e. from other decisions to C), and will therefore return that B cites C.
- Sources=2, the software will search for citations **_to_** C and for citations **_to_** the decisions that cite C, and will therefore return that B cites C and that A cites B.
  Changing the degrees of separation allows expanding or reducing the networks constructed with the different types of searches.

**_Combined Search._** A combined search where you combine an ECLI, Keyword, and / or Article search, can be done with the option ‘Add Query’. On the top of the frame, you will see different tabs, with each tab representing a search that will be combined with the searches in the other tabs.

![image](https://user-images.githubusercontent.com/31765316/162191471-745894ce-04c7-472b-b796-6d4d99f99aa7.png)

(Note: when conducting a search in one query tab that includes an ECLI, Keyword, and / or Article search, the search will be treated as an OR search, that is, the software will search for, for instance, the Keyword or for the Article.

### Search Results

A search will return all nodes that match the search (_result nodes_) + all of their source/target nodes (_citation nodes_) as indicated (which do not necessarily match the search input!)

**_Why am I seeing fewer results than on Rechtspraak.nl?_**
We face two technical limitations:

1. After submitting a search, the backend fetches as many result nodes as possible but it is limited to a max. of 10,000 result nodes + their citation nodes.
2. In the front, a max. of 1,000 nodes in total can be displayed. In order to present a meaningful result, a subnetwork of the backend result is computed in which

- only nodes that are linked to edges are contained (i.e. they cite another node or are being cited by another node)
- if a result node is included, also all of it citation nodes are included (up to a total of max. 700 nodes)

There are slight differences between the data on Rechstraak.nl and our data. Also, the text search functionality of both platforms might be implemented slightly differently.

**_Why do I only see a few nodes, although the backend result contains many nodes?_**

Since we want to display meaningful (sub)networks with only nodes that contain citations, it is possible that the backend reached its limit having found lots of nodes without citations and only few nodes with citations.

**_What do the alert messages mean?_**

- Warning: the backend limit was reached (10.000 result nodes + all target nodes)
- Network statistics fetched: when clicking on a node, you will be able to see its network statistics

**_Why do not all decisions have a full-text (or summary) available?_**

We rely on the data as published on Rechtspraak.nl. If Rechtspraak.nl does not have the full-text, we do not have it either. We have aimed to reduce this limitation by adding the full-texts and summaries from LegalIntelligence, if available. This enriched data is, however, only available if you login through SurfConext, as LegalIntelligence data is proprietary data that should only be accessed (and used!) with the appropriate permissions. If Rechtspraak.nl will publish more court decisions in the future, they will also become available in our software.

## Interacting with the network

**_Visualisation._** Node size and node color may be adjusted based on the available categories. Clicking on ‘Default’ will restore the original input.

**_Filter._** Filtering results in masking (partly) of the nodes that do not match the filter criteria. Filtering includes Year, Degree, Indegree, Outdegree, Community (community numbers can be obtained by inspecting the panel on the right after having clicked on a node), and whether the nodes appear in the query input, that is, the ‘hits’ found for the ECLI, Keyword, and / or Article search (as opposed to the references found in these ‘hits’).

**_History._** History keeps track of certain actions performed. Under History, it is possible to Undo, Redo, or Delete the actions. When selecting an item, one can add the action to a Playlist. The History tab is mostly relevant for node deletion and cluster creation.

**_Playlist._** The actions performed can be tracked in a playlist. This allows you to play the steps subsequently.

**_Clusters._** Clusters created will appear here.

**_Layout._** The layout can be adjusted. Cose and Euler usually work well.

**_Preferences._** Under ‘preferences, color schemes may be adjusted. Here, it is also possible to add/remove the nodes and edges labels. The theme color can also be changed to bright or dark. Developers may obtain an API.

## Tools

![image](https://user-images.githubusercontent.com/31765316/162197553-f5cb0098-f898-4be4-94b3-ae438f725b88.png) allows you to record all your events (actions), including changes of the node size and color, the layout, and even the selection of nodes. Recording starts when clicking the icon, which remains red during the recording. ![image](https://user-images.githubusercontent.com/31765316/162197871-569a3e54-95da-4d55-a62c-3868f86682e0.png) The recording stops when clicking the icon again, which results in the automatic export and download of a JSON file in which the events are stored. You can import the events by clicking followed by ‘Import Events’.

![image](https://user-images.githubusercontent.com/31765316/162197940-55d503ea-2bf6-4ab2-acc6-db01e05933de.png) triggers a screen capture. Clicking the icon starts the recording. Another click ends the recording. Note that the recording will not include the side panels.

![image](https://user-images.githubusercontent.com/31765316/162198037-81152b9d-fae4-4182-84c1-9950a3ae7910.png) provides for a variety of options.

Under **_Preferences_**, color schemes may be adjusted. Here, it is also possible to add/remove the nodes and edges labels. **_Theme_** allows for changing the color to bright or dark. Under **_Developer_**, you can obtain a key that can be used for the API.

**_Import_** and **_Export_** allows you to you can store and share a network with others. Note that it is advised to download the metadata (‘Download Metadata’) prior to exporting the network.

**_Import Events_** allows importing the actions you (or another user) carried out on a network. The data are exported to a JSON file, which can be shared with others, who can import the data with the import function. Because the metadata for a node is only fetched (and stored in your computer’s cache) for the node that you clicked on, you first need to download all metadata of the network. You can do this with the ‘DOWNLOAD METADATA’ option. If you then export, the JSON file will contain the metadata for all nodes of the network. The network statistics (which you find on the right-hand panel) should be included in the export file even without having performed the ‘DOWNLOAD METADATA’ operation.

The metadata are computed on the backend network (all result nodes with or without citations + all of their citation nodes, until limit reached). The network statistics are computed on the backend network (all result nodes with or without citations + all of their citation nodes, until the limit is reached). The computation might take longer t)han the first display of network. A success message notifies the user about the completion of the network.

## Videos

Instructional videos on legal network analysis can be found [here](https://maastrichtlawtech.github.io/LegalNetworkAnalysis/#/?id=videos). Videos that specifically apply to Case Law Explorer are:

### In Dutch

- [What is Case Law Explorer? (Wat is Case Law Explorer?)](https://zuyd.mediasite.com/Mediasite/Play/db6594fc00df4412a44f53b9f45c4bd91d) (in Dutch)

### In English

Instruction videos will follow.

## Examples

### Dutch Case Law

Detailed examples can be found for:

- ['Daderschap van rechtspersonen'](https://docs.google.com/document/d/1xtqeVgLR6YJobhIMAwjozsU5lzvRJzDi/edit?usp=sharing&ouid=101337972402489378078&rtpof=true&sd=true)
- ['Voorwaardelijk opzet'](https://drive.google.com/drive/folders/1cd9w2cuh-BpW-nHKYxKJecKBnB705F9B?usp=sharing)
- ['Noodweer(exces)'](https://drive.google.com/drive/folders/1V_UBoMwGAse0C2bB_YNRHzdOvZWCP5du?usp=sharing)

### ECHR Case Law

More information will be added once the case law is added to Case Law Explorer.

### CJEU Case Law

More information will be added once the case law is added to Case Law Explorer.

## Resources

Everything you need to know about LNA can be found on the [Legal Network Analysis website](https://maastrichtlawtech.github.io/LegalNetworkAnalysis/#/).
