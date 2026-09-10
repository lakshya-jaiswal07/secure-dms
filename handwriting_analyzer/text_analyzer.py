import re
from collections import Counter


STOPWORDS = {
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "i", "it", "for",
    "not", "on", "with", "he", "as", "you", "do", "at", "this", "but", "his",
    "by", "from", "they", "we", "say", "her", "she", "or", "an", "will", "my",
    "one", "all", "would", "there", "their", "what", "so", "up", "out", "if",
    "about", "who", "get", "which", "go", "me", "when", "make", "can", "like",
    "time", "no", "just", "him", "know", "take", "people", "into", "year", "your",
    "good", "some", "could", "them", "see", "other", "than", "then", "now", "look",
    "only", "come", "its", "over", "think", "also", "back", "after", "use", "two",
    "how", "our", "work", "first", "well", "way", "even", "new", "want", "because",
    "any", "these", "give", "day", "most", "us", "is", "was", "are", "were", "been",
    "has", "had", "did", "am"
}

INDIAN_CITIES = {
    "delhi", "mumbai", "bengaluru", "bangalore", "kolkata", "chennai", "hyderabad",
    "ahmedabad", "pune", "surat", "jaipur", "lucknow", "kanpur", "nagpur", "indore",
    "bhopal", "patna", "vadodara", "ghaziabad", "ludhiana", "agra", "nashik", "varanasi",
    "chandigarh", "noida", "gurugram", "gurgaon", "faridabad", "coimbatore", "kochi"
}


def extract_dates(text):
    """Extracts explicit date patterns without hallucinations."""
    dates = []
    # ISO formats: 2026-09-09, 2026/09/09
    iso_matches = re.findall(r"\b(?:\d{4}[-/]\d{1,2}[-/]\d{1,2})\b", text)
    dates.extend(iso_matches)

    # Standard formats: 09/09/2026, 09-09-2026, 9/9/26
    std_matches = re.findall(r"\b(?:\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\b", text)
    dates.extend(std_matches)

    # Written formats: 15th August 2025, Jan 12 2026, 12 January 2026
    written_matches = re.findall(
        r"\b(?:\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)(?:\s+\d{2,4})?)\b",
        text,
        re.IGNORECASE,
    )
    dates.extend(written_matches)

    # Days of week when mentioned as specific timeline anchor
    days = re.findall(r"\b(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b", text, re.IGNORECASE)
    for d in days:
        if d.title() not in [x.title() for x in dates]:
            dates.append(d.title())

    return list(dict.fromkeys(dates))


def extract_times(text):
    """Extracts time expressions like 10:30 AM, 14:00, etc."""
    time_matches = re.findall(
        r"\b(?:\d{1,2}:\d{2}(?::\d{2})?(?:\s*(?:AM|PM|am|pm))?)\b",
        text
    )
    return list(dict.fromkeys(time_matches))


def extract_names(text):
    """Extracts names associated with honorifics or legal titles."""
    names = []
    title_pattern = r"\b(?:Mr\.|Mrs\.|Ms\.|Dr\.|Prof\.|Officer|Inspector|Constable|Advocate|Judge|Justice|Shri|Smt\.)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b"
    for match in re.finditer(title_pattern, text):
        names.append(match.group(0).strip())

    return list(dict.fromkeys(names))


def extract_locations(text):
    """Extracts verified cities, states, and prepositional location cues."""
    locations = []
    # Known cities
    for word in re.findall(r"\b[A-Za-z]+\b", text):
        if word.lower() in INDIAN_CITIES:
            locations.append(word.title())

    # Prepositional location phrases: 'near Delhi', 'at Station'
    prep_locs = re.findall(r"\b(?:near|at|in|towards)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b", text)
    for loc in prep_locs:
        if loc.lower() not in STOPWORDS and len(loc) > 2:
            locations.append(loc.strip())

    return list(dict.fromkeys(locations))


def extract_organizations(text):
    """Extracts public institutions, government bodies, and legal organizations."""
    org_keywords = [
        "Police", "Department", "Court", "Hospital", "Ministry", "Authority",
        "Bank", "Government", "Govt", "Bureau", "Station", "HQ", "Corporation"
    ]
    orgs = []
    for kw in org_keywords:
        matches = re.findall(rf"\b(?:[A-Z][a-z]+\s+)?{kw}(?:\s+[A-Z][a-z]+)?\b", text, re.IGNORECASE)
        for m in matches:
            if m.strip().lower() not in STOPWORDS:
                orgs.append(m.strip().title())

    return list(dict.fromkeys(orgs))


def extract_legal_references(text):
    """Extracts FIR, IPC, CrPC, BNS, or Case docket numbers."""
    refs = []
    patterns = [
        r"\b(?:FIR\s*(?:No\.?|Number)?\s*[:#-]?\s*\d+(?:/\d+)?)\b",
        r"\b(?:(?:Section|Sec\.?)\s*\d+[A-Za-z]?(?:\s*(?:IPC|CrPC|BNS))?)\b",
        r"\b(?:(?:IPC|CrPC|BNS)\s*(?:Section|Sec\.?)?\s*\d+[A-Za-z]?)\b",
        r"\b(?:Case\s*(?:No\.?|Number)?\s*[:#-]?\s*[A-Za-z0-9/-]+)\b",
    ]
    for p in patterns:
        matches = re.findall(p, text, re.IGNORECASE)
        refs.extend(matches)

    return list(dict.fromkeys(refs))


def extract_contact_info(text):
    """Extracts phone numbers and email addresses."""
    emails = re.findall(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b", text)
    phones = re.findall(r"\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b", text)
    # 10 digit Indian mobile numbers: 9876543210
    indian_phones = re.findall(r"\b[6-9]\d{9}\b", text)
    all_phones = list(dict.fromkeys(phones + indian_phones))
    return {
        "emails": list(dict.fromkeys(emails)),
        "phones": all_phones
    }


def extract_amounts(text):
    """Extracts currency values and amounts."""
    amounts = re.findall(r"\b(?:Rs\.?|INR|\$|EUR|£)\s*[\d,]+(?:\.\d{2})?(?:/-)?\b", text, re.IGNORECASE)
    return list(dict.fromkeys(amounts))


def extract_keywords(text, top_n=8):
    """Extracts top significant words by frequency, removing stopwords."""
    words = re.findall(r"\b[A-Za-z]{3,}\b", text.lower())
    meaningful = [w for w in words if w not in STOPWORDS]
    counts = Counter(meaningful)
    return [word for word, _ in counts.most_common(top_n)]


def analyze_text(full_text, lines_list=None):
    """
    Performs comprehensive factual text analysis on transcribed document.
    Does NOT hallucinate entities. Returns empty lists for missing items.
    """
    clean_text = full_text.strip() if full_text else ""
    words = re.findall(r"\b\w+\b", clean_text)
    word_count = len(words)
    char_count = len(clean_text)

    # Line statistics
    lines = [l["text"].strip() for l in lines_list] if lines_list else [l.strip() for l in clean_text.split("\n") if l.strip()]
    total_lines = len(lines)
    avg_words_per_line = round(word_count / total_lines, 1) if total_lines > 0 else 0.0

    longest_line = max(lines, key=len) if lines else ""
    shortest_line = min(lines, key=len) if lines else ""

    # Entity extraction
    contacts = extract_contact_info(clean_text)

    return {
        "word_count": word_count,
        "character_count": char_count,
        "total_lines": total_lines,
        "average_words_per_line": avg_words_per_line,
        "longest_line": longest_line,
        "shortest_line": shortest_line,
        "dates": extract_dates(clean_text),
        "times": extract_times(clean_text),
        "names": extract_names(clean_text),
        "locations": extract_locations(clean_text),
        "organizations": extract_organizations(clean_text),
        "legal_references": extract_legal_references(clean_text),
        "phone_numbers": contacts["phones"],
        "email_addresses": contacts["emails"],
        "amounts": extract_amounts(clean_text),
        "keywords": extract_keywords(clean_text, top_n=10)
    }
